# AI Interview Scoring Backend

A FastAPI-based machine learning service that evaluates interview responses across multiple dimensions and provides detailed feedback.

## 🎯 Overview

This service analyzes interview Q&A sessions and provides:

- **Speech Analysis**: Fluency, filler words, speaking patterns
- **Content Analysis**: Relevance, depth, structure using sentence embeddings
- **Behavioral Analysis**: Response patterns and communication style
- **Body Language Analysis**: (Placeholder for future video analysis)
- **Overall Scoring**: Combined weighted score with radar chart breakdown

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+** (Tested with Python 3.13)
- **macOS/Linux** (Windows users may need additional setup)
- **Homebrew** (for macOS dependencies)

### 1. Environment Setup

```bash
# Navigate to score_model directory
cd score_model

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate   # Windows
```

### 2. Install Dependencies

```bash
# Install Python packages
pip install -r requirements.txt

# Install additional ML dependencies
pip install fastapi uvicorn xgboost supabase

# macOS: Install native library for XGBoost
brew install libomp

# Install Keras compatibility layer
pip install tf-keras
```

### 3. Environment Variables

Create a `.env` file in the `score_model` directory:

```bash
# Copy the example (already exists in your case)
cp .env.example .env

# Edit with your credentials
nano .env
```

Required variables:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_key
OPENAI_API_KEY=your_openai_api_key  # Optional, for AI refinement
```

### 4. Run the Server

```bash
# Make sure you're in the score_model directory with venv activated
cd /path/to/ailab1/score_model
source venv/bin/activate

# Start the FastAPI server
python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload

# Alternative: Direct Python execution
python main.py
```

The server will start at: **<http://localhost:8001>**

## 📋 API Endpoints

### Health Check

```http
GET /
```

Returns server status and loaded models.

### Evaluate Interview

```http
POST /evaluate
```

**Request Body:**

```json
{
  "session_id": "unique_session_identifier",
  "qas": [
    {
      "question": "Tell me about yourself",
      "answer": "I am a software engineer with 5 years of experience..."
    }
  ]
}
```

**Response:**

```json
{
  "session_id": "unique_session_identifier",
  "final_score": 78,
  "radar_scores": [
    {"subject": "Speech", "A": 85},
    {"subject": "Content", "A": 72},
    {"subject": "Behavior", "A": 80},
    {"subject": "Body Language", "A": 75}
  ],
  "detailed_scores": {
    "speech": 85,
    "content": 72,
    "behavioral": 80,
    "body_language": 75,
    "overall": 78
  },
  "feedback": {
    "strengths": [
      "Strong technical communication",
      "Good response structure"
    ],
    "improvements": [
      "Reduce filler words",
      "Provide more specific examples"
    ]
  }
}
```

## 🔧 Troubleshooting

### Common Issues

#### 1. "Bad Interpreter" Error with uvicorn

```bash
# Error: zsh: /opt/homebrew/bin/uvicorn: bad interpreter
# Solution: Use venv Python instead of global uvicorn

# ❌ Don't use global uvicorn
uvicorn main:app --port 8001

# ✅ Use venv Python
python -m uvicorn main:app --port 8001
```

#### 2. XGBoost Native Library Missing

```bash
# Error: XGBoost library not compiled with OpenMP
# Solution: Install libomp

brew install libomp
```

#### 3. Keras/TensorFlow Compatibility

```bash
# Error: No module named 'keras.utils'
# Solution: Install Keras compatibility layer

pip install tf-keras
```

#### 4. Supabase Connection Issues

```bash
# Check your .env file has correct credentials
cat .env

# Test connection
python -c "
from supabase import create_client
import os
from dotenv import load_dotenv
load_dotenv()
client = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY'))
print('✅ Supabase connection successful')
"
```

### Development Mode

For development with auto-reload:

```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

### Production Mode

For production deployment:

```bash
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8001
```

## 📁 Project Structure

```
score_model/
├── main.py                    # FastAPI application
├── train.py                   # Model training script
├── requirements.txt           # Python dependencies
├── .env                       # Environment variables
├── README.md                 # This file
├── venv/                     # Virtual environment
├── __pycache__/              # Python cache
├── dataset/                  # Training data
│   └── candidate_XX/
│       ├── labels.json       # Ground truth scores
│       └── transcript.txt    # Interview transcript
└── *.json                    # Trained ML models
    ├── speech_model.json
    ├── content_model.json
    ├── behavioral_model.json
    ├── body_language_model.json
    └── overall_model.json
```

## 🤖 Machine Learning Models

The system uses XGBoost regressors trained on interview data:

### Model Types

- **Speech Model**: Analyzes fluency, pace, filler words
- **Content Model**: Evaluates relevance, depth, structure using sentence embeddings
- **Behavioral Model**: Assesses communication patterns
- **Body Language Model**: Placeholder for future video analysis
- **Overall Model**: Combines all dimensions for final score

### Feature Engineering

- **Speech Features**: Word count, filler rate, fluency score
- **Content Features**: Semantic similarity (BERT embeddings), depth, structure
- **Behavioral Features**: Response length, sentence count
- **Combined Features**: All features for overall scoring

## 🔗 Integration

### With Next.js Frontend

The service integrates with the Next.js frontend via API routes:

```javascript
// Next.js API route example
const response = await fetch('http://localhost:8001/evaluate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    session_id: 'session-123',
    qas: questionAnswerPairs
  })
})
```

### Database Integration

Results are automatically saved to Supabase with the following schema:

```sql
CREATE TABLE interview_results (
  id SERIAL PRIMARY KEY,
  session_id TEXT UNIQUE,
  final_score INTEGER,
  radar_scores JSONB,
  detailed_scores JSONB,
  feedback JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 📊 Model Training

To retrain models with new data:

```bash
# Ensure you have training data in dataset/ directory
python train.py

# This will generate new *.json model files
```

## 🚀 Deployment

### Local Development

```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

### Docker Deployment

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8001
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
```

### Cloud Deployment

The service can be deployed to:

- **Heroku**: Use `gunicorn` with `Procfile`
- **AWS Lambda**: With `mangum` adapter
- **Digital Ocean**: Using Docker containers
- **Railway**: Direct Python deployment

## 🔒 Security Notes

- The `.env` file contains sensitive API keys - never commit to version control
- Use service keys for Supabase (not anon keys) for backend services
- Consider implementing rate limiting for production use
- Validate input data to prevent injection attacks

## 📝 License

MIT License - see project root for details.
