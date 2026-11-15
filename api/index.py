import os
import sys
from pathlib import Path

# Locate backend/app directory across serverless container execution layouts
api_dir = Path(__file__).resolve().parent
candidates = [
    api_dir.parent / "backend",
    api_dir / "backend",
    Path.cwd() / "backend",
    Path("/var/task/backend"),
    Path("/var/task"),
    api_dir.parent,
    Path.cwd(),
]

for candidate in candidates:
    if candidate.exists() and (candidate / "app").exists():
        if str(candidate) not in sys.path:
            sys.path.insert(0, str(candidate))
        break

from app.main import app
