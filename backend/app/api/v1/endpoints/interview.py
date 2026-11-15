from datetime import datetime, timezone
import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.interview import InterviewSession, InterviewTurn
from app.schemas.interview import (
    InterviewSessionCreate,
    InterviewSessionResponse,
    InterviewMessageRequest,
    InterviewCodeRequest,
    InterviewCompleteRequest,
    InterviewEvaluationScorecard,
    InterviewTurnResponse,
)
from app.services.interview.engine import InterviewEngine

router = APIRouter()


@router.post("/sessions", response_model=InterviewSessionResponse, status_code=status.HTTP_201_CREATED)
async def create_interview_session(
    body: InterviewSessionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    problem = InterviewEngine.get_seed_problem(body.role_target, body.difficulty)

    session = InterviewSession(
        user_id=current_user.id,
        title=problem["title"],
        role_target=body.role_target,
        difficulty=body.difficulty,
        problem_description=problem["description"],
        initial_code=problem["initial_code"],
        final_code=problem["initial_code"],
        status="in_progress",
    )
    db.add(session)
    await db.flush()

    # Initial AI interviewer welcome turn
    greeting = InterviewEngine.get_initial_greeting(session)
    first_turn = InterviewTurn(
        session_id=session.id,
        sender="interviewer",
        message=greeting,
        turn_index=1,
    )
    db.add(first_turn)
    await db.commit()
    await db.refresh(session, attribute_names=["turns"])
    return session


@router.get("/sessions", response_model=List[InterviewSessionResponse])
async def list_interview_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(InterviewSession)
        .options(selectinload(InterviewSession.turns))
        .where(InterviewSession.user_id == current_user.id)
        .order_by(InterviewSession.created_at.desc())
    )
    res = await db.execute(stmt)
    return res.scalars().all()


@router.get("/sessions/{session_id}", response_model=InterviewSessionResponse)
async def get_interview_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(InterviewSession)
        .options(selectinload(InterviewSession.turns))
        .where(InterviewSession.id == session_id, InterviewSession.user_id == current_user.id)
    )
    res = await db.execute(stmt)
    session = res.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview session not found.")
    return session


@router.post("/sessions/{session_id}/message", response_model=InterviewSessionResponse)
async def send_interview_message(
    session_id: str,
    body: InterviewMessageRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(InterviewSession)
        .options(selectinload(InterviewSession.turns))
        .where(InterviewSession.id == session_id, InterviewSession.user_id == current_user.id)
    )
    res = await db.execute(stmt)
    session = res.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview session not found.")

    if session.status != "in_progress":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Interview session is already completed.")

    # 1. Add candidate turn
    next_index = len(session.turns) + 1
    candidate_turn = InterviewTurn(
        session_id=session.id,
        sender="candidate",
        message=body.message,
        turn_index=next_index,
    )
    db.add(candidate_turn)

    if body.current_code:
        session.final_code = body.current_code

    await db.flush()

    # 2. Generate AI interviewer reply
    reply_text = await InterviewEngine.generate_response(
        session=session,
        turns=session.turns + [candidate_turn],
        user_message=body.message,
        current_code=body.current_code,
    )

    interviewer_turn = InterviewTurn(
        session_id=session.id,
        sender="interviewer",
        message=reply_text,
        turn_index=next_index + 1,
    )
    db.add(interviewer_turn)
    await db.commit()

    # Refresh turns relation
    await db.refresh(session, attribute_names=["turns"])
    return session


@router.post("/sessions/{session_id}/code", response_model=InterviewSessionResponse)
async def sync_interview_code(
    session_id: str,
    body: InterviewCodeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(InterviewSession)
        .options(selectinload(InterviewSession.turns))
        .where(InterviewSession.id == session_id, InterviewSession.user_id == current_user.id)
    )
    res = await db.execute(stmt)
    session = res.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview session not found.")

    session.final_code = body.code
    session.language = body.language or "python"
    await db.commit()
    await db.refresh(session, attribute_names=["turns"])
    return session


@router.post("/sessions/{session_id}/complete", response_model=InterviewSessionResponse)
async def complete_interview(
    session_id: str,
    body: InterviewCompleteRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(InterviewSession)
        .options(selectinload(InterviewSession.turns))
        .where(InterviewSession.id == session_id, InterviewSession.user_id == current_user.id)
    )
    res = await db.execute(stmt)
    session = res.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview session not found.")

    if body.final_code:
        session.final_code = body.final_code

    scorecard: InterviewEvaluationScorecard = await InterviewEngine.evaluate_session(
        session=session,
        turns=session.turns,
        final_code=body.final_code,
    )

    session.status = "completed"
    session.score = scorecard.score
    session.recommendation = scorecard.recommendation
    session.feedback = scorecard.model_dump_json()

    await db.commit()
    await db.refresh(session, attribute_names=["turns"])
    return session
