from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import load_config
from routes import metrics_router

config = load_config()
app = FastAPI(
    title="API для анализа производительности статистических анализаторов кода (НИР-3)",
    root_path="/api",
)

if config.DEBUG:
    allowed_origins = ["*"] if config.ALLOWED_ORIGINS == [] else config.ALLOWED_ORIGINS
else:
    allowed_origins = config.ALLOWED_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(metrics_router, prefix="/metrics")
