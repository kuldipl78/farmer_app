import os
from typing import List

# Simple configuration without Pydantic validation issues
class Settings:
    def __init__(self):
        # Database
        self.database_url = os.getenv("DATABASE_URL", "sqlite:///./farmer_marketplace.db")
        
        # JWT
        self.secret_key = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
        self.algorithm = os.getenv("ALGORITHM", "HS256")
        self.access_token_expire_minutes = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
        
        # Application
        self.debug = os.getenv("DEBUG", "True").lower() == "true"
        self.host = os.getenv("HOST", "0.0.0.0")
        self.port = int(os.getenv("PORT", "8000"))
    
    @property
    def allowed_origins(self) -> List[str]:
        """Get allowed origins from environment or use defaults."""
        origins_env = os.getenv("ALLOWED_ORIGINS")
        
        if origins_env:
            if origins_env.strip() == "*":
                return ["*"]
            else:
                return [origin.strip() for origin in origins_env.split(",")]
        
        # Allow all origins for mobile development
        # In production, you should restrict this to specific domains
        return ["*"]

settings = Settings()