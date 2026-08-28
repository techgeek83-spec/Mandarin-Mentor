import json
import os
from pathlib import Path

SESSION_DIR = Path("./sessions")
SESSION_DIR.mkdir(exist_ok=True)

def load_session(session_id: str = "default") -> list:
    file_path = SESSION_DIR / f"{session_id}.json"
    if file_path.exists():
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except json.JSONDecodeError:
            return []
    return []

def save_session(messages: list, session_id: str = "default"):
    file_path = SESSION_DIR / f"{session_id}.json"
    temp_path = SESSION_DIR / f"{session_id}.tmp"
    
    # Write to temp file first, then atomically replace to prevent corruption
    with open(temp_path, "w", encoding="utf-8") as f:
        json.dump(messages, f, ensure_ascii=False, indent=2)
    os.replace(temp_path, file_path)
