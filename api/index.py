import os
import sys
import traceback
from pathlib import Path

# Locate backend/app directory across serverless container execution layouts
current_file = Path(__file__).resolve()
api_dir = current_file.parent
root_dir = api_dir.parent

search_paths = [
    str(root_dir / "backend"),
    str(api_dir / "backend"),
    str(root_dir),
    str(api_dir),
    "/var/task/backend",
    "/var/task",
    os.path.join(os.getcwd(), "backend"),
    os.getcwd(),
]

for p in search_paths:
    if os.path.exists(p) and p not in sys.path:
        sys.path.insert(0, p)

try:
    from app.main import app
except Exception as e:
    err_tb = traceback.format_exc()
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse

    app = FastAPI(title="DevMind API Error Handler")

    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"])
    async def catch_all(path: str):
        return JSONResponse(
            status_code=500,
            content={
                "error": "Backend Startup Failed",
                "detail": str(e),
                "traceback": err_tb,
                "sys_path": sys.path,
                "cwd": os.getcwd(),
            },
        )
