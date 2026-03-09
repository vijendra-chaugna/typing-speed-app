from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
import mysql.connector
import os
import requests
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="TypeSpeed API", version="1.0.0")

# ── CORS — allow ALL origins in dev ──────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,   # must be False when allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer(auto_error=False)

# ── DB CONNECTION ─────────────────────────────────────────────────────────────
def get_db():
    try:
        ssl_disabled = os.getenv("DB_SSL_DISABLED", "false").lower() == "true"
        connect_args = dict(
            host=os.getenv("DB_HOST", "localhost"),
            port=int(os.getenv("DB_PORT", 3306)),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", ""),
            database=os.getenv("DB_NAME", "typespeed"),
            ssl_disabled=ssl_disabled,
        )
        if not ssl_disabled:
            connect_args["ssl_verify_cert"] = False
            connect_args["ssl_verify_identity"] = False
        conn = mysql.connector.connect(**connect_args)
        yield conn
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB connection failed: {str(e)}")
    finally:
        try:
            conn.close()
        except:
            pass

# ── GOOGLE AUTH ───────────────────────────────────────────────────────────────
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")

def verify_google_token(token: str) -> dict:
    # Try id_token first, then access_token userinfo
    resp = requests.get(
        f"https://www.googleapis.com/oauth2/v3/userinfo",
        headers={"Authorization": f"Bearer {token}"},
        timeout=10,
    )
    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid Google token")
    return resp.json()

def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db=Depends(get_db),
) -> Optional[dict]:
    if not credentials:
        return None
    token = credentials.credentials
    try:
        user_info = verify_google_token(token)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE google_id = %s", (user_info["sub"],))
    user = cursor.fetchone()
    if not user:
        cursor.execute(
            "INSERT INTO users (google_id, email, name, avatar_url) VALUES (%s, %s, %s, %s)",
            (user_info["sub"], user_info.get("email"), user_info.get("name"), user_info.get("picture")),
        )
        db.commit()
        cursor.execute("SELECT * FROM users WHERE google_id = %s", (user_info["sub"],))
        user = cursor.fetchone()
    cursor.close()
    return user

# ── SCHEMAS ───────────────────────────────────────────────────────────────────
class ScoreSubmit(BaseModel):
    net_wpm: float
    accuracy: float
    raw_wpm: float
    duration_seconds: int
    mistakes: int
    wpm_history: Optional[str] = None

class GoogleTokenBody(BaseModel):
    token: str

# ── ROUTES ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "time": datetime.now(timezone.utc).isoformat()}


@app.post("/auth/google")
def google_login(body: GoogleTokenBody, db=Depends(get_db)):
    user_info = verify_google_token(body.token)
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE google_id = %s", (user_info["sub"],))
    user = cursor.fetchone()
    if not user:
        cursor.execute(
            "INSERT INTO users (google_id, email, name, avatar_url) VALUES (%s, %s, %s, %s)",
            (user_info["sub"], user_info.get("email"), user_info.get("name"), user_info.get("picture")),
        )
        db.commit()
        cursor.execute("SELECT * FROM users WHERE google_id = %s", (user_info["sub"],))
        user = cursor.fetchone()
    cursor.close()
    return {
        "token": body.token,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "avatar_url": user["avatar_url"],
        },
    }


@app.post("/scores")
def submit_score(
    score: ScoreSubmit,
    current_user: Optional[dict] = Depends(get_current_user),
    db=Depends(get_db),
):
    user_id = current_user["id"] if current_user else None
    username = current_user["name"] if current_user else "Guest"
    cursor = db.cursor()
    cursor.execute(
        """INSERT INTO scores
           (user_id, username, net_wpm, accuracy, raw_wpm, duration_seconds, mistakes, wpm_history)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
        (user_id, username, score.net_wpm, score.accuracy, score.raw_wpm,
         score.duration_seconds, score.mistakes, score.wpm_history),
    )
    db.commit()
    score_id = cursor.lastrowid
    cursor.close()
    return {"id": score_id, "message": "Score saved"}


@app.get("/leaderboard")
def get_leaderboard(limit: int = 10, db=Depends(get_db)):
    cursor = db.cursor(dictionary=True)
    cursor.execute(
        """SELECT
               s.id,
               COALESCE(u.name, s.username, 'Guest') AS username,
               u.avatar_url,
               s.net_wpm,
               s.accuracy,
               s.raw_wpm,
               s.duration_seconds,
               s.mistakes,
               s.created_at
           FROM scores s
           LEFT JOIN users u ON s.user_id = u.id
           ORDER BY s.net_wpm DESC
           LIMIT %s""",
        (min(limit, 100),),
    )
    rows = cursor.fetchall()
    cursor.close()
    for r in rows:
        if isinstance(r["created_at"], datetime):
            r["created_at"] = r["created_at"].isoformat()
    return rows


@app.get("/scores/me")
def my_scores(current_user: dict = Depends(get_current_user), db=Depends(get_db)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Login required")
    cursor = db.cursor(dictionary=True)
    cursor.execute(
        """SELECT id, net_wpm, accuracy, raw_wpm, duration_seconds,
                  mistakes, wpm_history, created_at
           FROM scores WHERE user_id = %s
           ORDER BY created_at DESC LIMIT 20""",
        (current_user["id"],),
    )
    rows = cursor.fetchall()
    cursor.close()
    for r in rows:
        if isinstance(r["created_at"], datetime):
            r["created_at"] = r["created_at"].isoformat()
    return rows