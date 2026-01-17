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
    port: int = int(os.getenv("PORT", 8000))  # Render provides PORT
    
    # CORS - Allow all origins in production for now
    allowed_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:19006",  # Expo default port
        "exp://localhost:19000",   # Expo development
        "*"  # Allow all origins for production (you can restrict this later)
    ]
    
    class Config:
        env_file = ".env"


settings = Settings()