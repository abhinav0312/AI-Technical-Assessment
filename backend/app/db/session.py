import os
from pathlib import Path
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.config import settings

# Resolve database URL
db_url = settings.DATABASE_URL

# On Vercel / serverless or generic deployments, if using relative SQLite, resolve to absolute path
# or fallback to writable /tmp if in read-only serverless environment
if db_url.startswith("sqlite"):
    raw_path = db_url.replace("sqlite+aiosqlite:///", "").replace("sqlite:///", "")
    if not os.path.isabs(raw_path):
        # Check if running in Vercel lambda (VERCEL env var is '1')
        if os.environ.get("VERCEL") == "1":
            target_dir = Path("/tmp")
            target_path = target_dir / Path(raw_path).name
            # If bundled db exists in app root, copy it to /tmp if not already there
            bundled_db = Path(__file__).resolve().parent.parent.parent / Path(raw_path).name
            if bundled_db.exists() and not target_path.exists():
                import shutil
                try:
                    shutil.copyfile(bundled_db, target_path)
                except Exception:
                    pass
            db_url = f"sqlite+aiosqlite:///{target_path.as_posix()}"
        else:
            base_dir = Path(__file__).resolve().parent.parent.parent
            abs_db_path = (base_dir / raw_path).resolve()
            db_url = f"sqlite+aiosqlite:///{abs_db_path.as_posix()}"

# Configure connect_args based on DB dialect (e.g. SQLite requires check_same_thread=False)
connect_args = {}
if db_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_async_engine(
    db_url,
    echo=False,
    future=True,
    connect_args=connect_args,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
