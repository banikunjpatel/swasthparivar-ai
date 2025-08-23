import os
import hashlib
import openai
import asyncio
from typing import List, Optional, AsyncGenerator
from dotenv import load_dotenv

# ✅ Load environment variables (only once in your app, or skip if already in main.py)
load_dotenv()

# ✅ Set OpenAI API Key securely
openai.api_key = os.getenv("OPENAI_API_KEY")
if not openai.api_key:
    raise RuntimeError("❌ OPENAI_API_KEY not set in environment variables.")

# ✅ Fallback model (e.g., if not specified in task_type)
DEFAULT_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")

# Simple in-memory cache (replace with Redis or DB in production)
response_cache = {}

# ✅ Task-to-model mapping
def choose_model(task_type: str) -> str:
    low_cost_tasks = [
        "grocery_list",
        "recipe",
        "profile_summary",
        "dosha_explanation"
    ]
    if task_type in low_cost_tasks:
        return "gpt-3.5-turbo"
    return DEFAULT_MODEL

# ✅ Hash-based prompt cache key
def generate_cache_key(prompt: str, task_type: str) -> str:
    key_string = f"{task_type}:{prompt}"
    return hashlib.md5(key_string.encode()).hexdigest()

# ✅ Streamed GPT response (preferred)
async def generate_response_streaming(
    prompt: str,
    task_type: str = "default",
    temperature: float = 0.8,
    max_tokens: int = 4096,
    force_refresh: bool = False
) -> AsyncGenerator[str, None]:
    model = choose_model(task_type)
    cache_key = generate_cache_key(prompt, task_type)

    print(f"[DEBUG] Using model: {model}")
    print(f"[DEBUG] Cache key: {cache_key}")

    # Use force_refresh in the cache check
    if not force_refresh and cache_key in response_cache:
        print("[DEBUG] Returning cached response.")
        yield response_cache[cache_key]
        return

    print("[DEBUG] Sending request to OpenAI...")
    try:
        client = openai.AsyncOpenAI()
        messages = [{"role": "user", "content": prompt}]
        response = await client.chat.completions.create(
            model=model,
            messages= messages,
            temperature=temperature,
            max_tokens=max_tokens,
            stream=True,
        )
    except Exception as e:
        print(f"[ERROR] OpenAI API call failed: {e}")
        raise

    final_output = ""
    async for chunk in response:
        delta = chunk.choices[0].delta.content or ""
        final_output += delta
        yield delta

    print(f"[DEBUG] Final output: {final_output[:200]}...")  # Print first 200 chars for brevity
    response_cache[cache_key] = final_output

# ✅ Full GPT response (non-streamed, fallback or testing)
async def generate_response_full(
    prompt: str,
    task_type: str = "default",
    temperature: float = 0.8,
    max_tokens: int = 4096,
    force_refresh: bool = False
) -> str:
    model = choose_model(task_type)
    cache_key = generate_cache_key(prompt, task_type)

    # Use force_refresh in the cache check
    if not force_refresh and cache_key in response_cache:
        return response_cache[cache_key]

    client = openai.AsyncOpenAI()
    messages = [{"role": "user", "content": prompt}]
    response = await client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens
    )

    result = response.choices[0].message.content
    response_cache[cache_key] = result
    return result