from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..models.farmer_profile import FarmerProfile
from ..models.customer_profile import CustomerProfile
from ..utils.auth import verify_password, get_password_hash, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register")
def register_user(user_data: dict, db: Session = Depends(get_db)):
    """Register a new user."""
    try:
        # Debug logging
        password = user_data.get('password', '')
        print(f"DEBUG: Received password length: {len(password)}")
        print(f"DEBUG: Password bytes length: {len(password.encode('utf-8'))}")
        print(f"DEBUG: Password preview: {password[:10]}...")
        
        from ..schemas.auth import UserRegister
        from ..schemas.user import UserResponse
        
        # Validate input data
        validated_data = UserRegister(**user_data)
        
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == validated_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        try:
            print(f"DEBUG: About to hash password...")
            hashed_password = get_password_hash(validated_data.password)
            print(f"DEBUG: Password hashed successfully")
        except ValueError as e:
            print(f"DEBUG: ValueError in password hashing: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Password validation error: {str(e)}"
            )
        except Exception as e:
            print(f"DEBUG: Unexpected error in password hashing: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Password hashing failed: {str(e)}"
            )
        
        db_user = User(
            email=validated_data.email,
            password_hash=hashed_password,
            role=validated_data.role,
            first_name=validated_data.first_name,
            last_name=validated_data.last_name,
            phone=validated_data.phone
        )
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        # Create role-specific profile
        if validated_data.role == "farmer":
            farmer_profile = FarmerProfile(
                user_id=db_user.id,
                farm_name="My Farm",  # Default name, can be updated later
                farm_address="Address to be updated"  # Default address, can be updated later
            )
            db.add(farmer_profile)
        elif validated_data.role == "customer":
            customer_profile = CustomerProfile(user_id=db_user.id)
            db.add(customer_profile)
        
        db.commit()
        return db_user
        
    except HTTPException:
        # Re-raise HTTP exceptions (like email already exists)
        raise
    except Exception as e:
        # Log the error and rollback
        db.rollback()
        print(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/login")
def login_user(user_credentials: dict, db: Session = Depends(get_db)):
    """Login user and return access token."""
    from ..schemas.auth import UserLogin, Token
    
    # Validate input data
    validated_credentials = UserLogin(**user_credentials)
    
    user = db.query(User).filter(User.email == validated_credentials.email).first()
    
    if not user or not verify_password(validated_credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me")
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information."""
    return current_user


@router.post("/test-password")
def test_password_length(data: dict):
    """Test endpoint to debug password issues."""
    password = data.get('password', '')
    return {
        "password_length": len(password),
        "password_bytes": len(password.encode('utf-8')),
        "is_too_long": len(password.encode('utf-8')) > 72,
        "password_preview": password[:10] + "..." if len(password) > 10 else password
    }