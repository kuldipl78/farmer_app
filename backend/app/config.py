from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite:///./farmer_marketplace.db"
    
    # JWT
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Application
    debug: bool = True
    host: str = "0.0.0.0"
    port: int = 8000
    
    class Config:
        env_file = ".env"
    
    @property
    def allowed_origins(self) -> List[str]:
        """Get allowed origins from environment or use defaults."""
        origins_env = os.getenv("ALLOWED_ORIGINS")
        
        if origins_env:
            if origins_env.strip() == "*":
                return ["*"]
            else:
                return [origin.strip() for origin in origins_env.split(",")]
        
        # Default origins for development
        return [
            "http://localhost:3000",
            "http://localhost:19006",  # Expo default port
            "exp://localhost:19000",   # Expo development
        ]
    
    @property
    def port_from_env(self) -> int:
        """Get port from environment or default."""
        return int(os.getenv("PORT", self.port))


settings = Settings()