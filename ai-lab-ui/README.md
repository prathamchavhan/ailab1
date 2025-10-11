⚙️ Installation Guide
1️⃣ Clone the repository
git clone https://github.com/your-username/ai-interview-platform.git
cd ai-interview-platform

2️⃣ Install dependencies
npm install

3️⃣ Setup Supabase

Create a project on https://supabase.com

Then in your .env.local file, add:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

4️⃣ Setup AI APIs

Get your API keys:

OpenAI Whisper + GPT-4 → https://platform.openai.com

Gemini → https://makersuite.google.com/app/apikey

Then add to your .env.local:

NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

5️⃣ Run the project
npm run dev


Then visit:
👉 http://localhost:3000

📊 Folder Structure
app/
 ├── api/
 │   ├── generate-questions/
 │   ├── transcribe/
 │   ├── evaluate/
 │
 ├── dashboard/
 ├── interview/
 │   ├── analytics/
 │   ├── completed/
 │
 ├── profile/
 │   └── create/
 │
 ├── components/
 │   ├── Header.jsx
 │   ├── Sidebar.jsx
 │   ├── Dashboard.jsx
 │   ├── PerformanceChart.jsx
 │   ├── AIInterviewForm.jsx
 │   └── Announcement.jsx
 │
 ├── layout.jsx
 └── page.jsx

🧠 Optional: Run ML Model (Python Backend)

If you want to run your own ML evaluation locally:

cd score-model
pip install -r requirements.txt
uvicorn main:app --reload


Then configure your frontend to send evaluation requests to:

http://localhost:5000/evaluate