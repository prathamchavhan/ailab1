import json
import glob
import numpy as np
import xgboost as xgb
from sentence_transformers import SentenceTransformer, util

print("📥 Loading embedding model...")
embedder = SentenceTransformer("all-MiniLM-L6-v2")

# Prepare datasets
X_speech, y_speech = [], []
X_content, y_content = [], []
X_body, y_body = [], []
X_behavior, y_behavior = [], []
X_overall, y_overall = [], []

# -----------------------
# Feature extraction
# -----------------------
def extract_features(question: str, answer: str):
    words = answer.split()
    word_count = len(words)
    unique_words = len(set(words))

    # Speech features
    fillers = sum(1 for w in words if w.lower() in {"um", "uh", "like", "you", "know"})
    filler_rate = fillers / max(1, word_count)
    fluency = max(0, 100 - filler_rate * 100)
    speech_features = [word_count, fillers, filler_rate, fluency]

    # Content features
    a_vec = embedder.encode([answer], normalize_embeddings=True)
    q_vec = embedder.encode([question], normalize_embeddings=True)
    relevance = float(util.cos_sim(a_vec, q_vec)[0][0]) * 100
    depth = min(100, unique_words * 2)
    structure = 50 if any(x in answer.lower() for x in ["first", "then", "finally", "because"]) else 30
    content_features = [relevance, depth, structure, unique_words]

    # Body language (placeholder)
    body_features = [0.5]

    # Behavioral features
    behavior_features = [len(answer), len(answer.split("."))]

    overall_features = speech_features + content_features + body_features + behavior_features
    return speech_features, content_features, body_features, behavior_features, overall_features


# -----------------------
# Load dataset
# -----------------------
print("📚 Loading dataset...")
for file in glob.glob("dataset/*/labels.json"):
    with open(file, "r") as f:
        labels = json.load(f)

    transcript_file = file.replace("labels.json", "transcript.txt")
    with open(transcript_file, "r", encoding="utf-8") as f:
        answer = f.read().strip()

    question = "Describe your most recent project and your role in it."
    s, c, b, beh, o = extract_features(question, answer)

    X_speech.append(s); y_speech.append(labels["speech"])
    X_content.append(c); y_content.append(labels["content"])
    X_body.append(b); y_body.append(labels["body_language"])
    X_behavior.append(beh); y_behavior.append(labels["behavioral"])
    X_overall.append(o); y_overall.append(labels["overall"])

print(f"✅ Loaded {len(X_speech)} candidates.")

# -----------------------
# Train and save models
# -----------------------
def train_and_save(X, y, name):
    X, y = np.array(X), np.array(y)
    if len(X) < 3:
        print(f"⚠️ Not enough data to train {name}")
        return
    model = xgb.XGBRegressor(
        n_estimators=300,
        max_depth=5,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42
    )
    model.fit(X, y)
    model.save_model(f"{name}_model.json")
    print(f"✅ Saved {name}_model.json")

train_and_save(X_speech, y_speech, "speech")
train_and_save(X_content, y_content, "content")
train_and_save(X_body, y_body, "body_language")
train_and_save(X_behavior, y_behavior, "behavioral")
train_and_save(X_overall, y_overall, "overall")

print("🎯 Training complete!")
