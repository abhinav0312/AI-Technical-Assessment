from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.codetwin import SkillGraphVersion
from app.schemas.skillgraph import (
    SkillGraphResponse,
    SkillDetailResponse,
    SkillGraphVersionResponse,
)
from app.services.skillgraph import skillgraph_service

router = APIRouter()


def check_skillgraph_privacy_access(target_user_id: str, current_user: User):
    """
    Enforces SkillGraph Privacy Guard:
    Skill profiles and graph evidence are private to the candidate and authorized evaluators.
    """
    if target_user_id != current_user.id and current_user.role not in ("admin", "creator", "recruiter"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Candidate skill graph and evidence traces are strictly private.",
        )


@router.get("/graph", response_model=SkillGraphResponse)
async def get_skill_graph(
    user_id: Optional[str] = None,
    domain: Optional[str] = Query(None, description="Filter by domain"),
    status: Optional[str] = Query(None, description="Filter by mastery status: mastered, proficient, developing, unassessed"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    target_id = user_id or current_user.id
    check_skillgraph_privacy_access(target_id, current_user)

    data = await skillgraph_service.get_skill_graph(
        user_id=target_id,
        db=db,
        domain_filter=domain,
        status_filter=status,
    )
    return SkillGraphResponse(**data)


@router.get("/skills/{slug}", response_model=SkillDetailResponse)
async def get_skill_detail(
    slug: str,
    user_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    target_id = user_id or current_user.id
    check_skillgraph_privacy_access(target_id, current_user)

    data = await skillgraph_service.get_skill_detail(
        skill_slug=slug,
        user_id=target_id,
        db=db,
    )
    if not data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Skill '{slug}' not found in taxonomy.",
        )
    return SkillDetailResponse(**data)


@router.get("/versions", response_model=List[SkillGraphVersionResponse])
async def list_skillgraph_versions(
    db: AsyncSession = Depends(get_db),
):
    stmt = select(SkillGraphVersion).order_by(SkillGraphVersion.created_at.desc())
    versions = (await db.execute(stmt)).scalars().all()
    return [
        SkillGraphVersionResponse(
            id=v.id,
            version=v.version,
            title=v.title,
            description=v.description,
            is_active=v.is_active,
            graph_metadata=v.graph_metadata or {},
            created_at=v.created_at.strftime("%Y-%m-%d"),
        )
        for v in versions
    ]
