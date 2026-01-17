from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from ..config import settings
from ..database import get_db
from ..models.user import User, UserRole

# Password hashing with explicit bcrypt configuration
pwd_context = CryptContext(
    schemes=["bcrypt"], 
    deprecated="auto",
    bcrypt__rounds=12,  # Explicit rounds
    bcrypt__ident="2b"  # Use 2b variant
)

# JWT token scheme
security = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password with bcrypt length validation."""
    # Check password length before hashing (bcrypt limitation)
    password_bytes = len(password.encode('utf-8'))
    print(f"DEBUG get_password_hash: password='{password}', length={len(password)}, bytes={password_bytes}")
    
    if password_bytes > 72:
        raise ValueError(f"Password is too long for bcrypt hashing: {password_bytes} bytes")
    
    if password_bytes == 0:
        raise ValueError("Password cannot be empty")
    
    try:
        result = pwd_context.hash(password)
        print(f"DEBUG: Password hashed successfully, result length: {len(result)}")
        return result
    except Exception as e:
        print(f"DEBUG: Hashing failed with error: {type(e).__name__}: {str(e)}")
        # If it's the bcrypt 72-byte error, provide a clearer message
        if "72 bytes" in str(e):
            raise ValueError(f"bcrypt limitation: password too long ({password_bytes} bytes, max 72)")
        raise ValueError(f"Password hashing failed: {str(e)}")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt


def verify_token(token: str) -> dict:
    """Verify and decode a JWT token."""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get the current authenticated user."""
    token = credentials.credentials
    payload = verify_token(token)
    
    user_id: int = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )
    
    return user


def get_current_farmer(current_user: User = Depends(get_current_user)) -> User:
    """Get the current authenticated farmer."""
    if current_user.role != UserRole.FARMER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions. Farmer role required.",
        )
    return current_user


def get_current_customer(current_user: User = Depends(get_current_user)) -> User:
    """Get the current authenticated customer."""
    if current_user.role != UserRole.CUSTOMER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions. Customer role required.",
        )
    return current_user


def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    """Get the current authenticated admin."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions. Admin role required.",
        )
    return current_user