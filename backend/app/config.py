from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    DATABASE_URL: str = "mysql+pymysql://boson_user:1234@localhost:3306/nexusai_db"
    SECRET_KEY: str = "2IYjiVvuDsHv1VEgQvvjwE8K1A3AAjGfiowTwrUpQ4A"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    CORS_ORIGINS: str = "*"

    @property
    def cors_origins_list(self) -> List[str]:
        if self.CORS_ORIGINS == "*":
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


settings = Settings()
