import os
import logging
from logging.handlers import RotatingFileHandler

def get_logger(name):
    # ✅ Ensure logs directory exists
    os.makedirs("logs", exist_ok=True)

    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)

    handler = RotatingFileHandler("logs/mealplanner.log", maxBytes=2*1024*1024, backupCount=5)
    formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")
    handler.setFormatter(formatter)

    if not logger.handlers:
        logger.addHandler(handler)

    return logger