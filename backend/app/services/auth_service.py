from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.models.refresh_token import RefreshToken
from app.models.onboarding import Onboarding
from app.repositories.user_repository import UserRepository
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, AccessTokenResponse


class AuthService:
    def __init__(self, db: Session):
        self.db   = db
        self.repo = UserRepository(db)

    def register(self, data: RegisterRequest) -> TokenResponse:
        if self.repo.username_exists(data.username):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already taken")
        if self.repo.email_exists(data.email):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

        user = self.repo.create(
            username=data.username.lower(),
            email=data.email.lower(),
            password_hash=hash_password(data.password),
            first_name=data.first_name.strip(),
            last_name=data.last_name.strip(),
        )

        # Create blank onboarding record so the frontend can track progress
        onboarding = Onboarding(user_id=user.id)
        self.db.add(onboarding)
        self.db.commit()

        return self._issue_tokens(user)

    def login(self, data: LoginRequest) -> TokenResponse:
        user = self.repo.get_by_username(data.username)
        if not user or not verify_password(data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password",
            )
        if user.status != "active":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is inactive or suspended",
            )
        return self._issue_tokens(user)

    def refresh(self, refresh_token: str) -> AccessTokenResponse:
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

        stored = (
            self.db.query(RefreshToken)
            .filter(RefreshToken.token == refresh_token, RefreshToken.is_revoked == False)
            .first()
        )
        if not stored or stored.expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired or revoked")

        user = self.repo.get(payload["sub"])
        if not user or user.status != "active":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")

        access_token = create_access_token(str(user.id), user.role)
        return AccessTokenResponse(access_token=access_token)

    def logout(self, refresh_token: str) -> None:
        stored = self.db.query(RefreshToken).filter(RefreshToken.token == refresh_token).first()
        if stored:
            stored.is_revoked = True
            self.db.commit()

    def _issue_tokens(self, user) -> TokenResponse:
        access_token             = create_access_token(str(user.id), user.role)
        refresh_token, expires_at = create_refresh_token(str(user.id))

        db_token = RefreshToken(
            user_id=user.id,
            token=refresh_token,
            expires_at=expires_at,
        )
        self.db.add(db_token)
        self.db.commit()

        return TokenResponse(access_token=access_token, refresh_token=refresh_token)
