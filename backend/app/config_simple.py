import os

# Simple configuration without Pydantic validation issues
class Settings:
    # Database
    database_url = os.getenv("DATABASE_URL", "sqlite:///./farmer_marketplace.db")
    
    # JWT
    secret_key = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    algorithm = os.getenv("ALGORITHM", "HS256")
    access_token_expire_minutes = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # Application
    debug = os.getenv("DEBUG", "True").lower() == "true"
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    
    # CORS - Simple approach
    @property
    def allowed_origins(self):
        origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:19006")
        if origins.strip() == "*":
            return ["*"]
        return [origin.strip() for origin in origins.split(",")]

settings = Settings()