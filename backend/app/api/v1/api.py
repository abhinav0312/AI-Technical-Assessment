from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    users,
    challenges,
    submissions,
    thinktrace,
    dashboard,
    health,
    codetwin,
    bughunter,
    devsim,
    skillgraph,
)

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users & Profiles"])
api_router.include_router(challenges.router, prefix="/challenges", tags=["Challenges"])
api_router.include_router(submissions.router, prefix="/submissions", tags=["Submissions & Evaluation"])
api_router.include_router(thinktrace.router, prefix="/thinktrace", tags=["ThinkTrace AI Reasoning"])
api_router.include_router(codetwin.router, prefix="/codetwin", tags=["CodeTwin Skill Intelligence"])
api_router.include_router(skillgraph.router, prefix="/skillgraph", tags=["SkillGraph Visualization"])
api_router.include_router(bughunter.router, prefix="/bughunter", tags=["BugHunter Debugging Assessment"])
api_router.include_router(devsim.router, prefix="/devsim", tags=["DevSim Engineering Scenarios"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard Intelligence"])
