# Marketku API Migration - Setup & Testing Guide

## ✅ Migration Completed

The AI Website Builder backend has been successfully migrated from Groq API to Marketku API (OpenAI-compatible).

---

## 📋 What Was Changed

### Files Modified
- ✅ [`Backend/requirements.txt`](Backend/requirements.txt:1) - Replaced `groq` with `openai` and added `python-dotenv`
- ✅ [`Backend/ai/api_client.py`](Backend/ai/api_client.py:1) - New centralized API client module
- ✅ [`Backend/ai/website_planner.py`](Backend/ai/website_planner.py:1) - Updated to use Marketku API
- ✅ [`Backend/ai/theme_designer.py`](Backend/ai/theme_designer.py:1) - Updated to use Marketku API
- ✅ [`Backend/ai/layout_designer.py`](Backend/ai/layout_designer.py:1) - Updated to use Marketku API
- ✅ [`Backend/ai/groq_api_request.py`](Backend/ai/groq_api_request.py:1) - Replaced with deprecation notice

### Files Created
- ✅ [`Backend/.env.example`](Backend/.env.example:1) - Environment variable template
- ✅ [`Backend/.env`](Backend/.env:1) - Environment configuration file (needs your API key)

### API Changes
- **Old API**: Groq API with `qwen/qwen3.6-27b` model
- **New API**: Marketku API with `mk/sonnet-4.5-thinking-agentic` model
- **Endpoint**: `https://router.marketku.id/v1`

---

## 🚀 Setup Instructions

### Step 1: Install Dependencies

Navigate to the Backend directory and install the new dependencies:

```bash
cd Backend
pip install -r requirements.txt
```

This will install:
- `openai>=1.12.0` - OpenAI-compatible SDK for Marketku API
- `python-dotenv>=1.0.0` - Environment variable management

### Step 2: Configure Your API Key

Edit [`Backend/.env`](Backend/.env:1) and replace `your-api-key-here` with your actual Marketku API key:

```bash
# Open the .env file
nano Backend/.env

# Or using your preferred editor
code Backend/.env
```

Update this line:
```env
MARKETKU_API_KEY=your-actual-api-key-here
```

Your API key should start with: `sk-8b1e29c499ff470f-...`

### Step 3: Verify Configuration

Check that your `.env` file has all required values:

```bash
cat Backend/.env
```

Should show:
```
MARKETKU_API_KEY=sk-8b1e29c499ff470f-xxxxx-xxxxx
MARKETKU_BASE_URL=https://router.marketku.id/v1
MARKETKU_MODEL=mk/sonnet-4.5-thinking-agentic
DEFAULT_TEMPERATURE=0.6
DEFAULT_MAX_TOKENS=2048
```

---

## 🧪 Testing Instructions

### Test 1: Verify API Client Initialization

Create a test script to verify the API client works:

```bash
cd Backend/ai
python3 << 'EOF'
from api_client import get_client, MarketkuAPIClient

# Test configuration loading
config = MarketkuAPIClient.get_config()
print("✅ Configuration loaded:")
print(f"   Model: {config['model']}")
print(f"   Temperature: {config['temperature']}")
print(f"   Max Tokens: {config['max_tokens']}")

# Test client initialization
try:
    client = get_client()
    print("✅ API client initialized successfully")
except Exception as e:
    print(f"❌ Error: {e}")
EOF
```

Expected output:
```
✅ Configuration loaded:
   Model: mk/sonnet-4.5-thinking-agentic
   Temperature: 0.6
   Max Tokens: 2048
✅ API client initialized successfully
```

### Test 2: Test API Connection

```bash
cd Backend/ai
python3 << 'EOF'
from api_client import create_completion

try:
    completion = create_completion(
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Say 'API test successful!' and nothing else."}
        ],
        stream=True,
        max_tokens=50
    )
    
    print("Testing API connection...")
    text = ""
    for chunk in completion:
        try:
            content = chunk.choices[0].delta.content or ""
            text += content
            print(content, end="", flush=True)
        except:
            continue
    
    print("\n✅ API connection successful!")
    
except Exception as e:
    print(f"❌ API connection failed: {e}")
EOF
```

### Test 3: Start Backend Server

Start the FastAPI server to test the full integration:

```bash
cd Backend
uvicorn ai.main:app --reload --host 0.0.0.0 --port 8000
```

Expected output:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Test 4: Test Website Generation Endpoint

In a new terminal, test the `/post_prompt` endpoint:

```bash
curl -X POST "http://localhost:8000/post_prompt" \
  -F "prompt=Create a simple landing page for a coffee shop" \
  -F "type=website"
```

Expected response: JSON with `website`, `theme`, and `layout` objects.

### Test 5: Frontend Integration

1. Start the backend server (if not already running):
```bash
cd Backend
uvicorn ai.main:app --reload
```

2. Start the frontend dev server:
```bash
cd ai-website-builder
npm run dev
```

3. Open your browser to `http://localhost:5173`

4. Test website generation through the UI:
   - Enter a business description
   - Click generate
   - Verify the website is created successfully

---

## 🔍 Troubleshooting

### Error: "MARKETKU_API_KEY not found"

**Cause**: The `.env` file is missing or not properly configured.

**Solution**:
1. Verify [`Backend/.env`](Backend/.env:1) exists
2. Check that `MARKETKU_API_KEY` is set with your actual API key
3. Make sure you're running commands from the correct directory

### Error: "ModuleNotFoundError: No module named 'openai'"

**Cause**: Dependencies not installed.

**Solution**:
```bash
cd Backend
pip install -r requirements.txt
```

### Error: API returns 401 Unauthorized

**Cause**: Invalid or expired API key.

**Solution**:
1. Verify your API key in [`Backend/.env`](Backend/.env:1)
2. Make sure it starts with `sk-8b1e29c499ff470f-`
3. Contact Geraikita/Marketku support if the key is invalid

### Error: API returns 429 Too Many Requests

**Cause**: Rate limit exceeded.

**Solution**:
1. Wait a few minutes before retrying
2. Check your Marketku API usage limits
3. Consider implementing rate limiting in your application

### Error: "Connection timeout" or "Cannot connect to API"

**Cause**: Network issues or incorrect base URL.

**Solution**:
1. Verify the base URL in `.env`: `https://router.marketku.id/v1`
2. Check your internet connection
3. Verify the Marketku API service is operational

---

## 📊 Monitoring & Logging

To enable detailed API logging, you can modify [`Backend/ai/api_client.py`](Backend/ai/api_client.py:1) to add logging:

```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# In create_completion function:
logger.info(f"Making API call with model: {config['model']}")
```

---

## 🔐 Security Best Practices

1. ✅ **Never commit `.env` file** - Already in `.gitignore`
2. ✅ **Use environment variables** - Implemented via `python-dotenv`
3. ⚠️ **Rotate API keys regularly** - Recommended for production
4. ⚠️ **Monitor API usage** - Track costs and implement alerts
5. ⚠️ **Implement rate limiting** - Prevent abuse in production

---

## 🎯 Next Steps

1. **Install dependencies**: Run `pip install -r requirements.txt`
2. **Configure API key**: Edit [`Backend/.env`](Backend/.env:1) with your actual key
3. **Run tests**: Follow testing instructions above
4. **Test full flow**: Generate a website through the UI
5. **Monitor performance**: Compare with previous Groq API performance

---

## 📚 Additional Resources

- **API Client Module**: [`Backend/ai/api_client.py`](Backend/ai/api_client.py:1)
- **Migration Plan**: [`plans/MARKETKU_API_MIGRATION_PLAN.md`](plans/MARKETKU_API_MIGRATION_PLAN.md:1)
- **Environment Template**: [`Backend/.env.example`](Backend/.env.example:1)
- **Deprecated File**: [`Backend/ai/groq_api_request.py`](Backend/ai/groq_api_request.py:1)

---

## ✨ Summary

The migration is complete! You now have:
- ✅ Modern OpenAI-compatible API integration
- ✅ Secure environment variable configuration
- ✅ Centralized API client management
- ✅ Advanced AI model (`mk/sonnet-4.5-thinking-agentic`)
- ✅ Better code maintainability

**Estimated Time to Complete Setup**: 5-10 minutes

**Estimated Time for Full Testing**: 10-15 minutes
