# Interview Feature Integration Guide

This ready-to-drop-in guide helps you add interview functionality (question generation, transcription, ML scoring, and feedback) into your webapp. It is tailored to the project structure you provided and includes API contracts, Supabase schema, backend blueprint, frontend snippets, a step-by-step checklist, and troubleshooting.

Target codebase structure (your project)

```text
├── public
├── README.md
└── src
    ├── app
    │   ├── api
    │   │   ├── generate-questions
    │   │   │   └── route.js
    │   │   └── save-score
    │   │       └── route.js
    │   ├── interview
    │   │   ├── analytics
    │   │   │   └── page.jsx
    │   │   ├── completed
    │   │   │   └── page.jsx
    │   │   └── page.jsx
    ├── components
    │   ├── Sidebar.jsx
    │   └── Sidebar.module.css
    └── lib
        ├── supabaseClient.js
        └── supabaseServer.js
```

This guide assumes a separate scoring backend (FastAPI) running at `http://127.0.0.1:8000` for ML inference. It's recommended to keep ML dependencies isolated in that service, but you can port scoring logic to Node if desired.

---

## 1. Quick overview

- Frontend: UI pages to request questions, accept answers (text or audio), submit for evaluation, and display radar charts + feedback.
- API routes: `generate-questions` (returns questions), `save-score` (proxies to scoring backend and persists via Supabase server key).
- Scoring backend: `/evaluate` endpoint (POST) performs ML scoring and returns results.
- Database: Supabase table `interview_results` stores evaluation results.

---

## 2. API contracts

2.1 generate-questions (server route in your Next app)

- Path: `src/app/api/generate-questions/route.js`
- Method: GET or POST
- Request: optional body e.g. { role, level }
- Response JSON:

```json
[ { "id": "q1", "question": "Tell me about a time you solved a difficult problem." } ]
```

2.2 save-score (server route in your Next app)

- Path: `src/app/api/save-score/route.js`
- Method: POST
- Request JSON (scoring payload returned from scoring backend):

```json
{
  "session_id": "session-123",
  "final_score": 78.5,
  "radar_scores": [{ "subject": "Communication", "A": 80 }],
  "feedback": { "strengths": ["..."], "improvements": ["..."] }
}
```

- Response: 200 OK with saved object (or error).

2.3 Scoring backend (recommended, separate service)

- Path: `/evaluate` (POST)
- Request JSON (from frontend or your `save-score` route as proxy):

```json
{ "session_id": "session-123", "qas": [ { "question": "...", "answer": "..." } ] }
```

- Response JSON (example):

```json
{
  "final_score": 78.5,
  "radar_scores": [ { "subject": "Communication", "A": 80 } ],
  "feedback": { "strengths": ["..."], "improvements": ["..."] }
}
```

Notes

- The `save-score` route should use server-side Supabase helper (`supabaseServer.js`) with a service role key to persist results.

---

## 3. Supabase schema

Run this SQL in your Supabase project:

```sql
create table if not exists interview_results (
  id uuid default gen_random_uuid() primary key,
  session_id text not null,
  final_score numeric,
  radar_scores jsonb,
  feedback jsonb,
  created_at timestamptz default now()
);
```

Security

- Restrict writes with RLS and allow your server (service key) to upsert rows. The frontend should never send the service key.

---

## 4. Scoring backend blueprint (FastAPI)

Minimal, production-friendly outline. Save as `main.py` in a separate `score_model` service.

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import numpy as np
import xgboost as xgb
from sentence_transformers import SentenceTransformer, util

app = FastAPI()

class QAItem(BaseModel):
    question: str
    answer: str

class EvalRequest(BaseModel):
    session_id: str
    qas: List[QAItem]

# Lazy globals to avoid blocking import
embedder = None
models = {}

def load_models():
    global embedder, models
    if embedder is None:
        embedder = SentenceTransformer('all-MiniLM-L6-v2')
    for name in ['speech', 'content', 'body_language', 'behavioral', 'overall']:
        if name not in models:
            try:
                m = xgb.XGBRegressor()
                m.load_model(f'{name}_model.json')
                models[name] = m
            except Exception:
                models[name] = None

def extract_features(question: str, answer: str):
    words = answer.split()
    word_count = len(words)
    unique_words = len(set(words))
    fillers = sum(1 for w in words if w.lower() in {'um', 'uh', 'like', 'you', 'know'})
    filler_rate = fillers / max(1, word_count)
    fluency = max(0, 100 - filler_rate * 100)
    speech_features = [word_count, fillers, filler_rate, fluency]
    a_vec = embedder.encode([answer], normalize_embeddings=True)
    q_vec = embedder.encode([question], normalize_embeddings=True)
    relevance = float(util.cos_sim(a_vec, q_vec)[0][0]) * 100
    depth = min(100, unique_words * 2)
    structure = 50 if any(x in answer.lower() for x in ['first', 'then', 'finally', 'because']) else 30
    content_features = [relevance, depth, structure, unique_words]
    body_features = [0.5]
    behavior_features = [len(answer), len(answer.split('.'))]
    overall_features = speech_features + content_features + body_features + behavior_features
    return speech_features, content_features, body_features, behavior_features, overall_features

@app.on_event('startup')
def on_startup():
    load_models()

@app.get('/')
def health():
    return {'message': 'ML Interview Scoring API running'}

@app.post('/evaluate')
def evaluate(req: EvalRequest):
    if not req.session_id:
        raise HTTPException(status_code=400, detail='session_id required')
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
    # predict with models if available, otherwise return zeros/fallbacks
    results = {}
    results['speech'] = float(models['speech'].predict(avg(all_speech))[0]) if models.get('speech') else 0.0
    results['content'] = float(models['content'].predict(avg(all_content))[0]) if models.get('content') else 0.0
    results['body_language'] = float(models['body_language'].predict(avg(all_body))[0]) if models.get('body_language') else 0.0
    results['behavioral'] = float(models['behavioral'].predict(avg(all_behavior))[0]) if models.get('behavioral') else 0.0
    results['overall'] = float(models['overall'].predict(avg(all_overall))[0]) if models.get('overall') else np.mean(list(results.values()))
    # build radar and feedback (simple example)
    radar_scores = [
        { 'subject': 'Communication', 'A': round(results['speech'], 2) },
        { 'subject': 'Fluency', 'A': round((results['speech'] * 0.7 + results['content'] * 0.3), 2) }
    ]
    feedback = { 'strengths': [], 'improvements': [] }
    final_score = round(sum([r['A'] for r in radar_scores]) / len(radar_scores), 2) if radar_scores else 0.0
    return { 'final_score': final_score, 'radar_scores': radar_scores, 'feedback': feedback }
```

Run (example):

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirement.txt
# on macOS: brew install libomp
./venv/bin/python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

Notes

- Keep ML dependencies (torch, xgboost) inside this service. Use service-level keys for Supabase writes.

---

## 5. Frontend integration (code snippets)

5.1 Interview page (React / Next.js)

Add `src/app/interview/page.jsx` (or adapt your existing `src/app/interview/page.jsx`). Example:

```jsx
import React, { useEffect, useState } from 'react'

export default function InterviewPage() {
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)

  useEffect(() => {
    fetch('/api/generate-questions').then(r => r.json()).then(setQuestions)
  }, [])

  async function onSubmit() {
    const qas = questions.map(q => ({ question: q.question, answer: answers[q.id] || '' }))
    const res = await fetch('/api/save-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: `sess-${Date.now()}`, qas })
    })
    const data = await res.json()
    setResult(data)
  }

  return (
    <div>
      <h2>Interview</h2>
      {questions.map(q => (
        <div key={q.id}>
          <p>{q.question}</p>
          <textarea value={answers[q.id] || ''} onChange={e => setAnswers({ ...answers, [q.id]: e.target.value })} />
        </div>
      ))}
      <button onClick={onSubmit}>Submit</button>
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  )
}
```

5.2 `src/app/api/generate-questions/route.js` (simple example)

```js
export async function GET() {
  const questions = [
    { id: 'q1', question: 'Tell me about a time you solved a difficult problem.' },
    { id: 'q2', question: 'How do you prioritize tasks under pressure?' }
  ]
  return new Response(JSON.stringify(questions), { status: 200 })
}
```

5.3 `src/app/api/save-score/route.js` (proxy + persist)

```js
import { supabaseServer } from '../../../lib/supabaseServer'

export async function POST(req) {
  const body = await req.json()
  // Proxy to scoring backend
  const evalRes = await fetch('http://127.0.0.1:8000/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  const data = await evalRes.json()
  // Persist using server-side supabase helper
  const { error } = await supabaseServer.from('interview_results').upsert({
    session_id: body.session_id,
    final_score: data.final_score,
    radar_scores: data.radar_scores,
    feedback: data.feedback
  })
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  return new Response(JSON.stringify(data), { status: 200 })
}
```

Adjust the `supabaseServer` import to match your `src/lib/supabaseServer.js` API.

---

## 6. Implementation checklist

1. Create `interview_results` table in Supabase.
2. Add `src/app/api/generate-questions/route.js` (or hook to your LLM service).
3. Add `src/app/api/save-score/route.js` that proxies to scoring backend and persists.
4. Add / adapt `src/app/interview/page.jsx` UI to collect answers and call `/api/save-score`.
5. Run scoring backend (recommended) or implement scoring logic on server.
6. Add `src/app/interview/analytics/page.jsx` to query Supabase and render charts.

---

## 7. Troubleshooting & common fixes

- If `uvicorn` reports a bad shebang, run the scoring service with the venv Python:

```bash
./venv/bin/python -m uvicorn main:app
```

- On macOS, install OpenMP for xgboost:

```bash
brew install libomp
```

- If Transformers complains about Keras 3, install `tf-keras` in the venv:

```bash
pip install tf-keras
```

- Pre-warm sentence-transformers model to speed dev start:

```bash
python - <<'PY'
from sentence_transformers import SentenceTransformer
SentenceTransformer('all-MiniLM-L6-v2')
print('cached')
PY
```

---

## 8. Optional improvements

- Lazy-load heavy models on demand.
- Add authentication checks in `save-score` to ensure only authorized clients can persist.
- Add audio recording + transcription flow: record audio, POST to transcription service, use transcript as `answer`.
- Add unit tests for `extract_features` and scoring paths.

---

If you want I can:

- Create the example files (`route.js`, `page.jsx`) directly in your repo and wire them to `src/lib/supabaseServer.js`.
- Patch `score_model/main.py` to be lazy-loading and produce a Dockerfile for the scoring service.

Tell me which follow-up you'd like and I'll implement it.
