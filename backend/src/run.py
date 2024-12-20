import uvicorn

from config import load_config
from main import app

config = load_config()

if __name__ == "__main__":
    uvicorn.run(app, host=config.HOST, port=config.PORT)
