<div align="center">

# ⌨️ TypeSpeed

**A full-stack typing speed application built with React, FastAPI, and MySQL.**

Track your WPM, accuracy, and personal progress over time. Compete on a global leaderboard. Sign in with Google.

![TypeSpeed Banner](https://img.shields.io/badge/TypeSpeed-v1.0.0-e8ff47?style=for-the-badge&logoColor=black)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

</div>

---

## ✨ Features

- **⌨️ Typing Engine** — Real-time character highlighting, Net WPM, Raw WPM, accuracy, and mistake tracking
- **⏱️ Time Modes** — Choose from 15s, 30s, 60s, or 120s sessions
- **📝 Static Text Pool** — 4 curated texts per time category, sized to match the duration
- **✅ Auto-finish** — Test ends immediately when you complete the full text
- **📊 Progress Tracking** — Personal history graph + table stored in `localStorage` (no login needed)
- **🏆 Global Leaderboard** — Top 10 scores backed by a MySQL database on Aiven
- **🔐 Google OAuth** — Sign in with Google to save scores to the leaderboard
- **🚀 Deploy-ready** — Vercel (frontend) + Vercel (backend) + Aiven (MySQL)

---

## 🖥️ Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS        |
| Charts    | Recharts                            |
| Auth      | Google OAuth (`@react-oauth/google`)|
| Backend   | FastAPI (Python)                    |
| Database  | MySQL 8 (Aiven cloud)               |
| Hosting   | Vercel + Render                     |

---

## 📁 Project Structure

```
typespeed/
├── backend/
│   ├── main.py              ← FastAPI app (auth, scores, leaderboard)
│   ├── schema.sql           ← MySQL table definitions
│   ├── requirements.txt
│   ├── render.yaml          ← Render deploy config
│   └── .env.example
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── context/
        │   └── AuthContext.jsx        ← Google login state
        ├── hooks/
        │   ├── useTypingEngine.js     ← Core engine: timer, WPM, accuracy
        │   ├── useRandomText.js       ← Static text pool per duration
        │   ├── useProgressHistory.js  ← localStorage progress tracker
        │   └── useLeaderboard.js      ← Fetches global top 10
        ├── components/
        │   ├── Navbar.jsx
        │   ├── TypingArea.jsx         ← Character-level highlighting
        │   ├── StatsBar.jsx           ← Live stats display
        │   ├── ProgressPanel.jsx      ← Personal graph + table
        │   └── ResultsModal.jsx       ← End-of-session summary
        ├── pages/
        │   ├── GamePage.jsx
        │   └── LeaderboardPage.jsx
        └── utils/
            └── api.js                 ← Fetch wrapper with auth header
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- MySQL 8 (local or [Aiven](https://aiven.io))
- A [Google Cloud](https://console.cloud.google.com) project with OAuth 2.0 credentials

---

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/typespeed.git
cd typespeed
```

---

### 2. Database setup

Run `backend/schema.sql` in MySQL Workbench or via CLI:

```bash
mysql -h your-host -u your-user -p < backend/schema.sql
```

---

### 3. Backend setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Mac/Linux
venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your values (see Environment Variables section below)

# Run
uvicorn main:app --reload --port 8000
```

Visit `http://localhost:8000/health` → should return `{"status":"ok"}`

---

### 4. Frontend setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your values

# Run
npm run dev
```

Visit `http://localhost:5173`

---

## 🔧 Environment Variables

### Backend — `backend/.env`

```env
DB_HOST=your-mysql-host
DB_PORT=3306
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=typespeed
DB_SSL_DISABLED=false         # set true for local MySQL, false for Aiven

GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
FRONTEND_URL=http://localhost:5173
```

### Frontend — `frontend/.env`

```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

---

## 🔐 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com) → **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID** → **Web application**
3. Add **Authorized JavaScript origins**:
   ```
   http://localhost:5173
   https://your-app.vercel.app
   ```
4. Copy the **Client ID** and paste it into both `.env` files

---

## ☁️ Deployment

### Backend → Render

1. Push `backend/` to a GitHub repository
2. Go to [vervel.com](https://vervel.com) → **New Web Service** → connect your repo
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add all environment variables from `backend/.env`

### Frontend → Vercel

1. Push `frontend/` to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → **New Project** → import repo
3. Framework preset: **Vite**
4. Add environment variables:
   ```
   VITE_API_URL=https://your-api.onrender.com
   VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   ```
5. Deploy

### Database → Aiven

1. Create a free MySQL cluster at [aiven.io](https://aiven.io)
2. Download the **CA certificate** from the connection details page
3. Use the connection details in your backend `.env`
4. Run `schema.sql` via MySQL Workbench using the Aiven SSL connection

---

## 📡 API Endpoints

| Method | Endpoint        | Auth     | Description                  |
|--------|-----------------|----------|------------------------------|
| GET    | `/health`       | None     | Health check                 |
| POST   | `/auth/google`  | None     | Google login / register      |
| POST   | `/scores`       | Optional | Submit a completed session   |
| GET    | `/leaderboard`  | None     | Top 10 scores                |
| GET    | `/scores/me`    | Required | Current user's last 20 scores|

---

## 🧮 How WPM is Calculated

```
Raw WPM  = (words typed / elapsed seconds) × 60
Net WPM  = Raw WPM − (errors / minutes elapsed)
Accuracy = (correct characters / total typed) × 100
```

Net WPM penalises uncorrected errors, matching the standard used by MonkeyType and TypeRacer.


---

<div align="center">

Built with ❤️ by **Vijendra**

</div>
