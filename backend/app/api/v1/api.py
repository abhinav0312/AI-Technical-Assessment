from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, challenges, dashboard, health

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users & Profiles"])
api_router.include_router(challenges.router, prefix="/challenges", tags=["Challenges"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard Intelligence"])
