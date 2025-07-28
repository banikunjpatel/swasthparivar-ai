# openai_client.py

import os
import hashlib
import openai
import asyncio
from typing import List, Optional, AsyncGenerator

# Load from environment (fallback to gpt-4o)
DEFAULT_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")

# In-memory cache (simple dict — replace with Redis in production)
response_cache = {}

# Map tasks to preferred models
def choose_model(task_type: str) -> str:
    low_cost_tasks = [
        "grocery_list",
        "recipe",
        "profile_summary",
        "dosha_explanation"
    ]
    if task_type in low_cost_tasks:
        return "gpt-3.5-turbo"
    return "gpt-4o"  # default high-quality model

# Generate hash-based cache key
def generate_cache_key(prompt: str, task_type: str) -> str:
    key_string = f"{task_type}:{prompt}"
    return hashlib.md5(key_string.encode()).hexdigest()

# Main async OpenAI generator (streaming)
async def generate_response_streaming(
    prompt: str,
    task_type: str = "default",
    temperature: float = 0.4,
    max_tokens: int = 512
) -> AsyncGenerator[str, None]:
    model = choose_model(task_type)
    cache_key = generate_cache_key(prompt, task_type)

    # Return from cache if exists
    if cache_key in response_cache:
        yield response_cache[cache_key]
        return

    # Stream from OpenAI
    response = await openai.ChatCompletion.acreate(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        temperature=temperature,
        max_tokens=max_tokens,
        stream=True,
    )

    final_output = ""
    async for chunk in response:
        delta = chunk["choices"][0]["delta"].get("content", "")
        final_output += delta
        yield delta

    # Store in cache after streaming
    response_cache[cache_key] = final_output

# Optional: helper if you just want full response (not streaming)
async def generate_response_full(
    prompt: str,
    task_type: str = "default",
    temperature: float = 0.4,
    max_tokens: int = 512
) -> str:
    model = choose_model(task_type)
    cache_key = generate_cache_key(prompt, task_type)

    if cache_key in response_cache:
        return response_cache[cache_key]

    response = await openai.ChatCompletion.acreate(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        temperature=temperature,
        max_tokens=max_tokens
    )

    result = response["choices"][0]["message"]["content"]
    response_cache[cache_key] = result
    return result