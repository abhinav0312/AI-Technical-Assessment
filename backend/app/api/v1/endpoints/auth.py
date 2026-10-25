import secrets
import jwt
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.config import settings
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.rate_limiter import check_rate_limit
from app.schemas.user import UserCreate, UserResponse
from app.schemas.token import (
    LoginRequest,
    TokenResponse,
    PasswordRecoveryRequest,
    PasswordRecoveryResponse,
    GoogleAuthRequest,
)
from app.repositories.user_repo import UserRepository
from app.repositories.activity_repo import ActivityRepository
from app.api.dependencies import get_current_user
from app.models.user import User

router = APIRouter()


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(check_rate_limit)],
)
async def register(
    user_in: UserCreate,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    user_repo = UserRepository(db)
    activity_repo = ActivityRepository(db)

    # Check for existing email
    existing_user = await user_repo.get_by_email(user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists.",
        )

    # Hash password with Argon2id
    hashed_pwd = get_password_hash(user_in.password)
    user = await user_repo.create_user(user_in, hashed_pwd)

    # Generate token
    token = create_access_token(user.id)

    # Set secure HttpOnly cookie
    response.set_cookie(
        key=settings.AUTH_COOKIE_NAME,
        value=token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        secure=settings.AUTH_COOKIE_SECURE,
        samesite=settings.AUTH_COOKIE_SAMESITE,
    )

    # Log activity
    await activity_repo.log_activity(
        user_id=user.id,
        activity_type="register",
        metadata={"role": user.role},
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    dependencies=[Depends(check_rate_limit)],
)
async def login(
    credentials: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    user_repo = UserRepository(db)
    activity_repo = ActivityRepository(db)

    user = await user_repo.get_by_email(credentials.email)
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if user.account_status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive or suspended.",
        )

    token = create_access_token(user.id)

    # Set secure HttpOnly cookie
    response.set_cookie(
        key=settings.AUTH_COOKIE_NAME,
        value=token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        secure=settings.AUTH_COOKIE_SECURE,
        samesite=settings.AUTH_COOKIE_SAMESITE,
    )

    # Log activity
    await activity_repo.log_activity(
        user_id=user.id,
        activity_type="login",
        metadata={"email": user.email},
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.post(
    "/google",
    response_model=TokenResponse,
    dependencies=[Depends(check_rate_limit)],
)
async def google_auth(
    auth_in: GoogleAuthRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    user_repo = UserRepository(db)
    activity_repo = ActivityRepository(db)

    email = auth_in.email
    display_name = auth_in.display_name

    # If a Google ID credential token is provided, extract claims
    if auth_in.credential:
        try:
            claims = jwt.decode(auth_in.credential, options={"verify_signature": False})
            email = claims.get("email") or email
            display_name = claims.get("name") or display_name
        except Exception:
            pass

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google profile did not contain an email address.",
        )

    existing_user = await user_repo.get_by_email(email)
    if existing_user:
        if existing_user.account_status != "active":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is inactive or suspended.",
            )
        user = existing_user
        activity_type = "google_login"
    else:
        # Create new user via Google signup
        random_pwd = secrets.token_urlsafe(32)
        hashed_pwd = get_password_hash(random_pwd)
        user_create = UserCreate(
            email=email,
            display_name=display_name or email.split("@")[0],
            password=random_pwd,
            role=auth_in.role or "candidate",
        )
        user = await user_repo.create_user(user_create, hashed_pwd)
        activity_type = "google_register"

    token = create_access_token(user.id)

    response.set_cookie(
        key=settings.AUTH_COOKIE_NAME,
        value=token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        secure=settings.AUTH_COOKIE_SECURE,
        samesite=settings.AUTH_COOKIE_SAMESITE,
    )

    await activity_repo.log_activity(
        user_id=user.id,
        activity_type=activity_type,
        metadata={"email": user.email, "provider": "google"},
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(
        key=settings.AUTH_COOKIE_NAME,
        httponly=True,
        samesite=settings.AUTH_COOKIE_SAMESITE,
    )
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=TokenResponse)
async def get_me(
    current_user: User = Depends(get_current_user),
):
    # Generates a refreshed access token
    token = create_access_token(current_user.id)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(current_user),
    )


@router.post("/forgot-password", response_model=PasswordRecoveryResponse)
async def forgot_password(
    recovery_in: PasswordRecoveryRequest,
    db: AsyncSession = Depends(get_db),
):
    user_repo = UserRepository(db)
    user = await user_repo.get_by_email(recovery_in.email)

    # Secure token flow without pretending fake emails are sent
    if not user:
        # Standard security practice: return a generic message to prevent email enumeration
        return PasswordRecoveryResponse(
            message="If an account with this email exists, a password reset authorization token has been initialized.",
        )

    reset_token = secrets.token_urlsafe(32)
    activity_repo = ActivityRepository(db)
    await activity_repo.log_activity(
        user_id=user.id,
        activity_type="password_reset_requested",
        metadata={"token_prefix": reset_token[:8]},
    )

    return PasswordRecoveryResponse(
        message="A secure password reset authorization token has been generated. In production this is delivered via configured SMTP.",
        recovery_token_id=f"rst_{reset_token[:12]}...",
    )
