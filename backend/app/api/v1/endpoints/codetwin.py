from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.codetwin import Skill, LearningPlanItem, PersonalizedRecommendation
from app.schemas.codetwin import (
    CodeTwinDashboardResponse,
    SkillResponse,
    UserSkillProficiencyResponse,
    ErrorPatternResponse,
    RecommendationResponse,
    LearningPlanResponse,
    LearningPlanItemUpdate,
)
from app.services.codetwin import codetwin_service

router = APIRouter()


def check_skill_profile_access(target_user_id: str, current_user: User):
    """
    Enforces CodeTwin Privacy Guard:
    Skill profiles are private to the candidate and authorized reviewers (admin, creator, recruiter).
    Candidates cannot view other candidates' skill profiles.
    """
    if target_user_id != current_user.id and current_user.role not in ("admin", "creator", "recruiter"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Candidate skill profiles and evidence traces are strictly private.",
        )


@router.get("/dashboard", response_model=CodeTwinDashboardResponse)
async def get_codetwin_dashboard(
    user_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    target_id = user_id or current_user.id
    check_skill_profile_access(target_id, current_user)

    dashboard = await codetwin_service.get_or_compute_dashboard(target_id, db)
    return CodeTwinDashboardResponse(**dashboard)


@router.get("/skills", response_model=List[SkillResponse])
async def list_taxonomy_skills(
    domain: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Skill)
    if domain:
        stmt = stmt.where(Skill.domain == domain)
    stmt = stmt.order_by(Skill.domain, Skill.name)
    res = await db.execute(stmt)
    skills = res.scalars().all()
    return [SkillResponse.model_validate(s) for s in skills]


@router.get("/recommendations", response_model=List[RecommendationResponse])
async def get_recommendations(
    user_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    target_id = user_id or current_user.id
    check_skill_profile_access(target_id, current_user)

    dashboard = await codetwin_service.get_or_compute_dashboard(target_id, db)
    return [RecommendationResponse(**r) for r in dashboard["recommended_activities"]]


@router.post("/recommendations/{recommendation_id}/dismiss")
async def dismiss_recommendation(
    recommendation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(PersonalizedRecommendation).where(
        PersonalizedRecommendation.id == recommendation_id,
        PersonalizedRecommendation.user_id == current_user.id,
    )
    rec = (await db.execute(stmt)).scalar_one_or_none()
    if not rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recommendation not found.")

    rec.status = "dismissed"
    await db.commit()
    return {"message": "Recommendation dismissed"}


@router.get("/learning-plan", response_model=Optional[LearningPlanResponse])
async def get_learning_plan(
    user_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    target_id = user_id or current_user.id
    check_skill_profile_access(target_id, current_user)

    dashboard = await codetwin_service.get_or_compute_dashboard(target_id, db)
    if dashboard.get("active_learning_plan"):
        return LearningPlanResponse(**dashboard["active_learning_plan"])
    return None


@router.patch("/learning-plan/items/{item_id}")
async def update_learning_plan_item(
    item_id: str,
    payload: LearningPlanItemUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(LearningPlanItem).where(LearningPlanItem.id == item_id)
    item = (await db.execute(stmt)).scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan item not found.")

    if payload.is_completed is not None:
        item.is_completed = payload.is_completed
    if payload.is_rejected is not None:
        item.is_rejected = payload.is_rejected

    await db.commit()
    return {
        "id": item.id,
        "is_completed": item.is_completed,
        "is_rejected": item.is_rejected,
    }
