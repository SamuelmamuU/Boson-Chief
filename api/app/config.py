import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: int = int(os.getenv("DB_PORT", "3306"))
    DB_USER: str = os.getenv("DB_USER", "boson_user")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "030304")
    DB_NAME: str = os.getenv("DB_NAME", "boson_agent")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "GIbu0E5CkLXJh3AnrUkt2cEs6OogrNlOoMN2QHPYCd9")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    @property
    def DATABASE_URL(self) -> str:
        return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

settings = Settings()
