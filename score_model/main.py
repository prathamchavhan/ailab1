# from fastapi import FastAPI, HTTPException
# from pydantic import BaseModel
# from typing import List
# import numpy as np
# import os
# import xgboost as xgb
# from sentence_transformers import SentenceTransformer, util
# from supabase import create_client, Client
# from dotenv import load_dotenv

# # -----------------------
# # Load environment variables
# # -----------------------
# load_dotenv()  # 👈 ensures .env file is read in Windows too

# SUPABASE_URL = os.getenv("SUPABASE_URL")
# SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# if not SUPABASE_URL or not SUPABASE_KEY:
#     raise RuntimeError("❌ Missing SUPABASE_URL or SUPABASE_KEY. Check your .env file!")

# # -----------------------
# # Initialize FastAPI app
# # -----------------------
# app = FastAPI(title="AI Interview Scoring API")

# # -----------------------
# # Supabase Client
# # -----------------------
# supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# # -----------------------
# # Load embedding model
# # -----------------------
# embedder = SentenceTransformer("all-MiniLM-L6-v2")

# # -----------------------
# # Load trained models
# # -----------------------
# models = {}
# for name in ["speech", "content", "body_language", "behavioral", "overall"]:
#     try:
#         m = xgb.XGBRegressor()
#         m.load_model(f"{name}_model.json")
#         models[name] = m
#         print(f"✅ Loaded {name}_model.json")
#     except:
#         print(f"⚠️ Could not load {name}_model.json")

# # -----------------------
# # Request Models
# # -----------------------
# class QAItem(BaseModel):
#     question: str
#     answer: str

# class EvalRequest(BaseModel):
#     session_id: str
#     qas: List[QAItem]

# # -----------------------
# # Feature Extraction
# # -----------------------
# def extract_features(question: str, answer: str):
#     words = answer.split()
#     word_count = len(words)
#     unique_words = len(set(words))

#     # Speech
#     fillers = sum(1 for w in words if w.lower() in {"um", "uh", "like", "you", "know"})
#     filler_rate = fillers / max(1, word_count)
#     fluency = max(0, 100 - filler_rate * 100)
#     speech_features = [word_count, fillers, filler_rate, fluency]

#     # Content
#     a_vec = embedder.encode([answer], normalize_embeddings=True)
#     q_vec = embedder.encode([question], normalize_embeddings=True)
#     relevance = float(util.cos_sim(a_vec, q_vec)[0][0]) * 100
#     depth = min(100, unique_words * 2)
#     structure = 50 if any(x in answer.lower() for x in ["first", "then", "finally", "because"]) else 30
#     content_features = [relevance, depth, structure, unique_words]

#     # Body language (placeholder)
#     body_features = [0.5]

#     # Behavioral (simple proxies)
#     behavior_features = [len(answer), len(answer.split("."))]

#     # Overall features
#     overall_features = speech_features + content_features + body_features + behavior_features

#     return speech_features, content_features, body_features, behavior_features, overall_features

# # -----------------------
# # Feedback Rules
# # -----------------------
# def feedback_for_score(pillar: str, score: float) -> str:
#     if pillar == "speech":
#         if score > 80:
#             return "Strong fluency and clarity."
#         elif score > 60:
#             return "Good speech, but reduce filler words."
#         else:
#             return "Work on clarity and avoid too many fillers."
#     elif pillar == "content":
#         if score > 80:
#             return "Detailed and relevant answers."
#         elif score > 60:
#             return "Decent content, but add more structure and examples."
#         else:
#             return "Answers are too shallow or off-topic."
#     elif pillar == "body_language":
#         if score > 80:
#             return "Confident posture and good eye contact."
#         elif score > 60:
#             return "Body language acceptable, but maintain better posture."
#         else:
#             return "Poor body language, work on eye contact and gestures."
#     elif pillar == "behavioral":
#         if score > 80:
#             return "Good consistency and time management."
#         elif score > 60:
#             return "Okay behavioral flow, but refine consistency."
#         else:
#             return "Answers lack consistency and timing balance."
#     return ""

# # -----------------------
# # Routes
# # -----------------------
# @app.get("/")
# def home():
#     return {"message": "AI Interview Scoring API is running 🎉"}

# @app.post("/evaluate")
# def evaluate(req: EvalRequest):
#     if not req.session_id:
#         raise HTTPException(status_code=400, detail="session_id required")

#     all_speech, all_content, all_body, all_behavior, all_overall = [], [], [], [], []

#     # Extract features
#     for qa in req.qas:
#         s, c, b, beh, o = extract_features(qa.question, qa.answer)
#         all_speech.append(s)
#         all_content.append(c)
#         all_body.append(b)
#         all_behavior.append(beh)
#         all_overall.append(o)

#     # Average features
#     speech_vec = np.mean(np.array(all_speech), axis=0).reshape(1, -1)
#     content_vec = np.mean(np.array(all_content), axis=0).reshape(1, -1)
#     body_vec = np.mean(np.array(all_body), axis=0).reshape(1, -1)
#     behavior_vec = np.mean(np.array(all_behavior), axis=0).reshape(1, -1)
#     overall_vec = np.mean(np.array(all_overall), axis=0).reshape(1, -1)

#     # Predictions
#     results = {}
#     if "speech" in models:
#         results["speech"] = float(models["speech"].predict(speech_vec)[0])
#     if "content" in models:
#         results["content"] = float(models["content"].predict(content_vec)[0])
#     if "body_language" in models:
#         results["body_language"] = float(models["body_language"].predict(body_vec)[0])
#     if "behavioral" in models:
#         results["behavioral"] = float(models["behavioral"].predict(behavior_vec)[0])
#     if "overall" in models:
#         results["overall"] = float(models["overall"].predict(overall_vec)[0])
#     else:
#         results["overall"] = np.mean([
#             results.get("speech", 0),
#             results.get("content", 0),
#             results.get("body_language", 0),
#             results.get("behavioral", 0)
#         ])

#     # Feedback
#     feedback = {
#         "speech": feedback_for_score("speech", results.get("speech", 0)),
#         "content": feedback_for_score("content", results.get("content", 0)),
#         "body_language": feedback_for_score("body_language", results.get("body_language", 0)),
#         "behavioral": feedback_for_score("behavioral", results.get("behavioral", 0)),
#     }

#     # Final response
#     response = {
#         "final_score": round(results["overall"], 2),
#         "radar_scores": [
#             {"subject": "Speech", "A": round(results.get("speech", 0), 2)},
#             {"subject": "Content", "A": round(results.get("content", 0), 2)},
#             {"subject": "Body Language", "A": round(results.get("body_language", 0), 2)},
#             {"subject": "Behavioral", "A": round(results.get("behavioral", 0), 2)}
#         ],
#         "feedback": feedback
#     }

#     # Save to Supabase
#     try:
#         data = {
#             "session_id": req.session_id,
#             "final_score": response["final_score"],
#             "radar_scores": response["radar_scores"],
#             "feedback": response["feedback"]
#         }
#         print("🚀 Saving to Supabase:", data)  # debug log
#         res = supabase.table("interview_results").upsert(data).execute()
#         print("📦 Supabase response:", res)
#     except Exception as e:
#         print(f"⚠️ Error saving results: {e}")

#     return response
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
# Pydantic Request Models
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

    # Speech
    fillers = sum(1 for w in words if w.lower() in {"um", "uh", "like", "you", "know"})
    filler_rate = fillers / max(1, word_count)
    fluency = max(0, 100 - filler_rate * 100)
    speech_features = [word_count, fillers, filler_rate, fluency]

    # Content
    a_vec = embedder.encode([answer], normalize_embeddings=True)
    q_vec = embedder.encode([question], normalize_embeddings=True)
    relevance = float(util.cos_sim(a_vec, q_vec)[0][0]) * 100
    depth = min(100, unique_words * 2)
    structure = 50 if any(x in answer.lower() for x in ["first", "then", "finally", "because"]) else 30
    content_features = [relevance, depth, structure, unique_words]

    # Body language (placeholder for now)
    body_features = [0.5]

    # Behavioral (simple proxies)
    behavior_features = [len(answer), len(answer.split("."))]

    # Combined
    overall_features = speech_features + content_features + body_features + behavior_features

    return speech_features, content_features, body_features, behavior_features, overall_features

# -----------------------
# Rule-based Feedback Generator
# -----------------------
def band(score: float) -> str:
    if score >= 75: return "high"
    if score >= 55: return "mid"
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
        improvements.append("Add examples to improve content clarity.")
    else:
        improvements.append("Responses need better structure and depth.")

    # Body Language
    if band(scores["body_language"]) == "high":
        strengths.append("Body language shows confidence and engagement.")
    else:
        improvements.append("Maintain eye contact and improve posture.")

    # Behavioral
    if band(scores["behavioral"]) == "high":
        strengths.append("Behavioral flow is consistent and professional.")
    else:
        improvements.append("Use the STAR method to describe experiences clearly.")

    return {"strengths": strengths[:4], "improvements": improvements[:4]}

# -----------------------
# Optional: AI Feedback Refinement
# -----------------------
def refine_feedback_with_ai(base_feedback: dict, scores: dict, qas: list) -> dict:
    if not OPENAI_API_KEY:
        return base_feedback

    try:
        from openai import OpenAI
        client = OpenAI(api_key=OPENAI_API_KEY)

        prompt = f"""
You are an expert interview coach.
Refine this feedback into short, motivational bullet points.

Scores:
{json.dumps(scores, indent=2)}

Candidate Answers (first 2 shown):
{json.dumps(qas[:2], indent=2)}

Base feedback:
{json.dumps(base_feedback, indent=2)}

Return valid JSON only:
{{
  "strengths": [string],
  "improvements": [string]
}}
"""
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
        )
        text = resp.choices[0].message.content or "{}"
        refined = json.loads(text)
        if "strengths" in refined and "improvements" in refined:
            return refined
        return base_feedback
    except Exception as e:
        print("⚠️ AI Feedback Refinement failed:", e)
        return base_feedback

# -----------------------
# Routes
# -----------------------
@app.get("/")
def home():
    return {"message": "🚀 AI Interview Scoring API is running"}

@app.post("/evaluate")
def evaluate(req: EvalRequest):
    if not req.session_id:
        raise HTTPException(status_code=400, detail="session_id required")

    all_speech, all_content, all_body, all_behavior, all_overall = [], [], [], [], []

    # Extract features for each question
    for qa in req.qas:
        s, c, b, beh, o = extract_features(qa.question, qa.answer)
        all_speech.append(s)
        all_content.append(c)
        all_body.append(b)
        all_behavior.append(beh)
        all_overall.append(o)

    # Aggregate features
    def avg(v): return np.mean(np.array(v), axis=0).reshape(1, -1)
    speech_vec, content_vec, body_vec, behavior_vec, overall_vec = map(avg, [all_speech, all_content, all_body, all_behavior, all_overall])

    # Predict scores
    results = {
        "speech": float(models["speech"].predict(speech_vec)[0]) if "speech" in models else 0,
        "content": float(models["content"].predict(content_vec)[0]) if "content" in models else 0,
        "body_language": float(models["body_language"].predict(body_vec)[0]) if "body_language" in models else 0,
        "behavioral": float(models["behavioral"].predict(behavior_vec)[0]) if "behavioral" in models else 0,
    }
    results["overall"] = float(models["overall"].predict(overall_vec)[0]) if "overall" in models else np.mean(list(results.values()))

    # Generate feedback (rule-based first)
    feedback = generate_feedback(results)
    # Refine feedback with AI (optional)
    feedback = refine_feedback_with_ai(feedback, results, req.qas)

    # Prepare response payload
    response = {
        "final_score": round(results["overall"], 2),
        "radar_scores": [
            {"subject": "Speech", "A": round(results["speech"], 2)},
            {"subject": "Content", "A": round(results["content"], 2)},
            {"subject": "Body Language", "A": round(results["body_language"], 2)},
            {"subject": "Behavioral", "A": round(results["behavioral"], 2)},
            {"subject": "Overall", "A": round(results["overall"], 2)},
        ],
        "feedback": feedback,
    }

    # Save results to Supabase
    try:
        data = {
            "session_id": req.session_id,
            "final_score": response["final_score"],
            "radar_scores": response["radar_scores"],
            "feedback": response["feedback"],
        }
        print("📝 Saving to Supabase:", json.dumps(data, indent=2))
        res = supabase.table("interview_results").upsert(data).execute()
        print("📦 Supabase response:", res)
    except Exception as e:
        print(f"⚠️ Error saving to Supabase: {e}")

    return response
