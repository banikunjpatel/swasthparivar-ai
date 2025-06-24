from openai import OpenAI
import os
from fastapi import HTTPException
from dotenv import load_dotenv
from app.utils.timing import timed
from app.utils.logger import get_logger

logger = get_logger(__name__)
load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@timed
def call_gpt(prompt: str, model: str = "gpt-4o", max_tokens: int = 1500, temperature: float = 0) -> str:
    try:
        logger.debug("Calling GPT with model gpt-4o...")
        
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=temperature,
            max_tokens=max_tokens
        )

        result = response.choices[0].message.content

        if isinstance(result, str):
            return result.strip()
        else:
            logger.error(f"❌ GPT response is not a string: {type(result)} — {result}")
            raise HTTPException(status_code=500, detail="GPT response is not a valid string.")
    
    except Exception as e:
        logger.error(f"GPT call failed: {e}")
        raise HTTPException(status_code=500, detail=f"OpenAI API failed: {str(e)}")