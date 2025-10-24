from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import numpy as np
import os
import xgboost as xgb
from sentence_transformers import SentenceTransformer, util
from supabase import create_client, Client
from dotenv import load_dotenv
import json

# -----------------------
# Load environment variables
# -----------------------
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")  # optional for AI refinement

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("❌ Missing SUPABASE_URL or SUPABASE_KEY. Check your .env file!")

# -----------------------
# Initialize FastAPI app
# -----------------------
app = FastAPI(title="AI Interview Scoring & Feedback API")

# -----------------------
# Supabase Client
# -----------------------
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# -----------------------
# Load embedding model
# -----------------------
embedder = SentenceTransformer("all-MiniLM-L6-v2")

# -----------------------
# Load trained ML models
# -----------------------
models = {}
for name in ["speech", "content", "body_language", "behavioral", "overall"]:
    try:
        m = xgb.XGBRegressor()
        m.load_model(f"{name}_model.json")
        models[name] = m
        print(f"✅ Loaded {name}_model.json")
    except Exception as e:
        print(f"⚠️ Could not load {name}_model.json: {e}")


# -----------------------
# Request Models
# -----------------------
class QAItem(BaseModel):
    question: str
    answer: str


class EvalRequest(BaseModel):
    session_id: str
    qas: List[QAItem]


# -----------------------
# Feature Extraction
# -----------------------
def extract_features(question: str, answer: str):
    words = answer.split()
    word_count = len(words)
    unique_words = len(set(words))

    # 🎤 Speech
    fillers = sum(1 for w in words if w.lower() in {"um", "uh", "like", "you", "know"})
    filler_rate = fillers / max(1, word_count)
    fluency = max(0, 100 - filler_rate * 100)
    speech_features = [word_count, fillers, filler_rate, fluency]

    # 🧠 Content
    a_vec = embedder.encode([answer], normalize_embeddings=True)
    q_vec = embedder.encode([question], normalize_embeddings=True)
    relevance = float(util.cos_sim(a_vec, q_vec)[0][0]) * 100
    depth = min(100, unique_words * 2)
    structure = (
        50
        if any(x in answer.lower() for x in ["first", "then", "finally", "because"])
        else 30
    )
    content_features = [relevance, depth, structure, unique_words]

    # 💪 Body language (placeholder for now)
    body_features = [0.5]

    # 🧍 Behavioral
    behavior_features = [len(answer), len(answer.split("."))]

    # Combined
    overall_features = (
        speech_features + content_features + body_features + behavior_features
    )
    return (
        speech_features,
        content_features,
        body_features,
        behavior_features,
        overall_features,
    )


# -----------------------
# Feedback Generator
# -----------------------
def band(score: float) -> str:
    if score >= 75:
        return "high"
    if score >= 55:
        return "mid"
    return "low"


def generate_feedback(scores: dict) -> dict:
    strengths, improvements = [], []

    # Speech
    if band(scores["speech"]) == "high":
        strengths.append("Speech is fluent and confident.")
    elif band(scores["speech"]) == "mid":
        improvements.append("Reduce filler words and maintain steady pacing.")
    else:
        improvements.append("Practice clarity and pronunciation to improve delivery.")

    # Content
    if band(scores["content"]) == "high":
        strengths.append("Answers are structured and relevant.")
    elif band(scores["content"]) == "mid":
        improvements.append("Add more examples or context for clarity.")
    else:
        improvements.append("Responses need better structure and detail.")

    # Body Language
    if band(scores["body_language"]) == "high":
        strengths.append("Body language shows confidence and engagement.")
    else:
        improvements.append("Maintain eye contact and improve posture.")

    # Behavioral
    if band(scores["behavioral"]) == "high":
        strengths.append("Behavioral flow is consistent and professional.")
    else:
        improvements.append("Use STAR method for structured storytelling.")

    return {"strengths": strengths[:4], "improvements": improvements[:4]}


# -----------------------
# Routes
# -----------------------
@app.get("/")
def home():
    return {"message": "🚀 ML Interview Scoring API is running"}


@app.post("/evaluate")
def evaluate(req: EvalRequest):
    if not req.session_id:
        raise HTTPException(status_code=400, detail="session_id required")

    all_speech, all_content, all_body, all_behavior, all_overall = [], [], [], [], []

    for qa in req.qas:
        s, c, b, beh, o = extract_features(qa.question, qa.answer)
        all_speech.append(s)
        all_content.append(c)
        all_body.append(b)
        all_behavior.append(beh)
        all_overall.append(o)

    def avg(v):
        return np.mean(np.array(v), axis=0).reshape(1, -1)

    results = {
        "speech": (
            float(models["speech"].predict(avg(all_speech))[0])
            if "speech" in models
            else 0
        ),
        "content": (
            float(models["content"].predict(avg(all_content))[0])
            if "content" in models
            else 0
        ),
        "body_language": (
            float(models["body_language"].predict(avg(all_body))[0])
            if "body_language" in models
            else 0
        ),
        "behavioral": (
            float(models["behavioral"].predict(avg(all_behavior))[0])
            if "behavioral" in models
            else 0
        ),
    }
    results["overall"] = (
        float(models["overall"].predict(avg(all_overall))[0])
        if "overall" in models
        else np.mean(list(results.values()))
    )

    # 🧮 Derive 7 Radar Metrics
    radar_scores = [
        {"subject": "Communication", "A": round(results["speech"], 2)},
        {
            "subject": "Fluency",
            "A": round((results["speech"] * 0.7 + results["content"] * 0.3), 2),
        },
        {
            "subject": "Professionalism",
            "A": round((results["content"] * 0.6 + results["behavioral"] * 0.4), 2),
        },
        {"subject": "Creativity", "A": 0.0},  # Gemini will fill later
        {"subject": "Problem Solving", "A": round(results["content"], 2)},
        {"subject": "Attitude", "A": round(results["behavioral"], 2)},
        {
            "subject": "Confidence",
            "A": round((results["speech"] * 0.5 + results["body_language"] * 0.5), 2),
        },
    ]

    # Generate feedback
    feedback = generate_feedback(results)

    # 🧠 Calculate final score (average of radar metrics excluding 0)
    valid_scores = [r["A"] for r in radar_scores if r["A"] > 0]
    final_score = round(sum(valid_scores) / len(valid_scores), 2) if valid_scores else 0

    # Build response
    response = {
        "final_score": final_score,
        "radar_scores": radar_scores,
        "feedback": feedback,
    }

    # Save to Supabase
    try:
        data = {
            "session_id": req.session_id,
            "final_score": final_score,
            "radar_scores": radar_scores,
            "feedback": feedback,
        }
        print("📝 Saving to Supabase:", json.dumps(data, indent=2))
        supabase.table("interview_results").upsert(data).execute()
    except Exception as e:
        print(f"⚠️ Error saving to Supabase: {e}")

    return response
