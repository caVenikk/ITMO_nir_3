import os
from dataclasses import dataclass
from functools import lru_cache

from dotenv import load_dotenv

load_dotenv()


@dataclass
class Config:
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    _ALLOWED_ORIGINS: str = os.getenv("ALLOWED_ORIGINS", "")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"

    @property
    def ALLOWED_ORIGINS(self) -> list[str]:  # noqa: N802
        return self._ALLOWED_ORIGINS.split(",") if self._ALLOWED_ORIGINS else []


@lru_cache(maxsize=1)
def load_config():
    return Config()
