"""
DEPRECATED: This file has been replaced by api_client.py

The Groq API integration has been migrated to Marketku API (OpenAI-compatible).
All API calls now use the centralized client in api_client.py.

For the new API client, see: Backend/ai/api_client.py

Example usage of the new API client:
----------------------------------------

from api_client import get_client, create_completion

# Method 1: Using the helper function (recommended)
completion = create_completion(
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Generate a website plan"}
    ],
    temperature=0.6,
    stream=True,
    response_format={"type": "json_object"}
)

# For streaming responses
text = ""
for chunk in completion:
    try:
        text += chunk.choices[0].delta.content or ""
    except Exception:
        continue

# Method 2: Using the client directly
from api_client import get_client

client = get_client()
response = client.chat.completions.create(
    model="mk/sonnet-4.5-thinking-agentic",  # From config
    messages=[...],
    stream=True
)

Configuration:
--------------
API configuration is managed via environment variables in Backend/.env:

MARKETKU_API_KEY=your-api-key-here
MARKETKU_BASE_URL=https://router.marketku.id/v1
MARKETKU_MODEL=mk/sonnet-4.5-thinking-agentic
DEFAULT_TEMPERATURE=0.6
DEFAULT_MAX_TOKENS=2048

See Backend/.env.example for a template.

Migration completed: 2026-08-20
"""
