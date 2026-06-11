from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

class Settings(BaseSettings):
    MONGO_URI: str = "mongodb://localhost:27017"
    DB_NAME: str = "vendorsync"
    JWT_SECRET: str = "vendorsync_super_secret_jwt_key_change_in_production"
    JWT_EXPIRE_HOURS: int = 72
    GROQ_API_KEY: str = ""
    FRONTEND_URL: str = "http://localhost:5173"
    PORT: int = 8000

    class Config:
        env_file = "../.env"
        extra = "ignore"

settings = Settings()
