# Marketku API Migration Plan

## Executive Summary

Migrate the AI Website Builder backend from Groq API to Marketku API (OpenAI-compatible) to leverage the `mk/sonnet-4.5-thinking-agentic` model for improved website generation capabilities.

---

## Current Architecture Analysis

### Files Using Groq API
1. [`Backend/ai/groq_api_request.py`](Backend/ai/groq_api_request.py:1) - Legacy/test file with hardcoded Groq client
2. [`Backend/ai/website_planner.py`](Backend/ai/website_planner.py:1) - Website structure generation
3. [`Backend/ai/theme_designer.py`](Backend/ai/theme_designer.py:1) - Visual theme generation
4. [`Backend/ai/layout_designer.py`](Backend/ai/layout_designer.py:1) - Responsive layout generation

### Current API Usage Pattern
```python
from groq import Groq

client = Groq(api_key="gsk_...")

completion = client.chat.completions.create(
    model="qwen/qwen3.6-27b",
    messages=[...],
    temperature=0.6,
    max_completion_tokens=2048,
    response_format={"type": "json_object"},
    stream=True
)
```

### Current Issues
- ❌ API keys hardcoded in 4 separate files
- ❌ No centralized configuration
- ❌ No environment variable support
- ❌ Potential security risk
- ❌ Difficult to maintain and update

---

## Target Architecture

### Marketku API Configuration
- **Base URL:** `https://router.marketku.id/v1`
- **Model:** `mk/sonnet-4.5-thinking-agentic`
- **API Key Format:** `sk-8b1e29c499ff470f-f7zw3y-d9e7e286...`
- **Compatibility:** OpenAI-compatible (use OpenAI SDK)

### Benefits of Migration
- ✅ More advanced reasoning capabilities
- ✅ Better structured output generation
- ✅ Improved context handling for complex tasks
- ✅ OpenAI-compatible standard interface

---

## Migration Strategy

### Phase 1: Foundation Setup
**Goal:** Create centralized API configuration with security best practices

#### 1.1 Update Dependencies
**File:** [`Backend/requirements.txt`](Backend/requirements.txt:1)

**Action:** Replace Groq SDK with OpenAI SDK
```diff
- groq==1.5.0
+ openai>=1.12.0
+ python-dotenv>=1.0.0
```

#### 1.2 Create Environment Configuration
**File:** `Backend/.env` (new file)

**Action:** Create environment file for secure API key storage
```env
# Marketku API Configuration
MARKETKU_API_KEY=sk-8b1e29c499ff470f-f7zw3y-d9e7e286...
MARKETKU_BASE_URL=https://router.marketku.id/v1
MARKETKU_MODEL=mk/sonnet-4.5-thinking-agentic

# Optional: Fallback configuration
DEFAULT_TEMPERATURE=0.6
DEFAULT_MAX_TOKENS=2048
```

#### 1.3 Update .gitignore
**File:** [`.gitignore`](.gitignore:1)

**Action:** Ensure environment files are not committed
```
Backend/.env
Backend/ai/.env
.env
*.env
```

---

### Phase 2: Create Centralized API Client

#### 2.1 Create API Client Module
**File:** `Backend/ai/api_client.py` (new file)

**Purpose:** Single source of truth for API configuration

**Features:**
- Load configuration from environment variables
- Provide singleton client instance
- Handle API key validation
- Support fallback configurations
- Streaming and non-streaming support

**Interface:**
```python
from api_client import get_client, create_completion

# Get configured client
client = get_client()

# Helper for completions
response = create_completion(
    messages=[...],
    temperature=0.6,
    stream=True
)
```

---

### Phase 3: Update AI Modules

#### 3.1 Update website_planner.py
**File:** [`Backend/ai/website_planner.py`](Backend/ai/website_planner.py:1)

**Changes:**
- Remove hardcoded Groq client initialization
- Import centralized client from [`api_client.py`](Backend/ai/api_client.py:1)
- Update model reference to use config
- Keep existing logic and prompts unchanged

**Before:**
```python
from groq import Groq
client = Groq(api_key="gsk_...")
completion = client.chat.completions.create(model="qwen/qwen3.6-27b", ...)
```

**After:**
```python
from api_client import create_completion
completion = create_completion(messages=messages, stream=True)
```

#### 3.2 Update theme_designer.py
**File:** [`Backend/ai/theme_designer.py`](Backend/ai/theme_designer.py:1)

**Changes:**
- Replace `_client()` function with centralized import
- Remove hardcoded API key
- Update model reference
- Keep theme generation logic intact

#### 3.3 Update layout_designer.py
**File:** [`Backend/ai/layout_designer.py`](Backend/ai/layout_designer.py:1)

**Changes:**
- Remove hardcoded Groq client
- Use centralized client
- Update model reference
- Maintain responsive layout logic

#### 3.4 Handle groq_api_request.py
**File:** [`Backend/ai/groq_api_request.py`](Backend/ai/groq_api_request.py:1)

**Decision:** This file appears to be a legacy test/example file

**Options:**
1. **Remove entirely** - If not used in production
2. **Update as example** - Rename to `api_example.py` and update
3. **Archive** - Move to `Backend/ai/legacy/` folder

**Recommendation:** Remove if unused, as the logic is duplicated in other files

---

### Phase 4: Testing Strategy

#### 4.1 Unit Testing
**Test Cases:**
- API client initialization
- Environment variable loading
- Error handling for missing keys
- Streaming response handling
- JSON response parsing

#### 4.2 Integration Testing
**Test Scenarios:**
1. Generate website structure with sample prompt
2. Generate theme for existing website tree
3. Generate responsive layout information
4. Handle file uploads and text extraction
5. Test FastAPI endpoints with new API

#### 4.3 Validation Checklist
- [ ] API client connects successfully to Marketku
- [ ] Website generation produces valid JSON
- [ ] Theme generation follows allowed selectors/properties
- [ ] Layout generation returns responsive data
- [ ] Streaming responses work correctly
- [ ] Error handling works for API failures
- [ ] FastAPI endpoints return expected responses

---

## Implementation Details

### API Client Implementation Structure

```python
# Backend/ai/api_client.py

import os
from typing import Optional, Dict, Any, Generator
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class MarketkuAPIClient:
    """Singleton client for Marketku API"""
    
    _instance: Optional[OpenAI] = None
    _config: Dict[str, str] = {}
    
    @classmethod
    def get_instance(cls) -> OpenAI:
        """Get or create singleton client instance"""
        if cls._instance is None:
            cls._initialize()
        return cls._instance
    
    @classmethod
    def _initialize(cls):
        """Initialize API client with configuration"""
        api_key = os.getenv("MARKETKU_API_KEY")
        base_url = os.getenv("MARKETKU_BASE_URL", "https://router.marketku.id/v1")
        
        if not api_key:
            raise ValueError("MARKETKU_API_KEY not found in environment")
        
        cls._instance = OpenAI(
            api_key=api_key,
            base_url=base_url
        )
        
        cls._config = {
            "model": os.getenv("MARKETKU_MODEL", "mk/sonnet-4.5-thinking-agentic"),
            "temperature": float(os.getenv("DEFAULT_TEMPERATURE", "0.6")),
            "max_tokens": int(os.getenv("DEFAULT_MAX_TOKENS", "2048"))
        }
    
    @classmethod
    def get_config(cls) -> Dict[str, Any]:
        """Get current configuration"""
        if not cls._config:
            cls._initialize()
        return cls._config.copy()

def get_client() -> OpenAI:
    """Get configured Marketku API client"""
    return MarketkuAPIClient.get_instance()

def create_completion(
    messages: list,
    temperature: Optional[float] = None,
    max_tokens: Optional[int] = None,
    stream: bool = True,
    response_format: Optional[Dict[str, str]] = None,
    **kwargs
) -> Any:
    """Create chat completion with default configuration"""
    client = get_client()
    config = MarketkuAPIClient.get_config()
    
    params = {
        "model": config["model"],
        "messages": messages,
        "temperature": temperature or config["temperature"],
        "max_tokens": max_tokens or config["max_tokens"],
        "stream": stream,
        **kwargs
    }
    
    if response_format:
        params["response_format"] = response_format
    
    return client.chat.completions.create(**params)
```

---

## Migration Execution Steps

### Step 1: Backup Current System
```bash
cd Backend/ai
git add .
git commit -m "Backup before Marketku API migration"
```

### Step 2: Install Dependencies
```bash
cd Backend
pip install openai>=1.12.0 python-dotenv>=1.0.0
pip uninstall groq
```

### Step 3: Create Environment File
```bash
cd Backend
cat > .env << EOL
MARKETKU_API_KEY=your-actual-api-key-here
MARKETKU_BASE_URL=https://router.marketku.id/v1
MARKETKU_MODEL=mk/sonnet-4.5-thinking-agentic
DEFAULT_TEMPERATURE=0.6
DEFAULT_MAX_TOKENS=2048
EOL
```

### Step 4: Create API Client
- Create `Backend/ai/api_client.py` with implementation above

### Step 5: Update Each AI Module
- Update website_planner.py
- Update theme_designer.py
- Update layout_designer.py
- Remove or archive groq_api_request.py

### Step 6: Test Integration
```bash
cd Backend/ai
python -m pytest tests/  # If tests exist
# OR manually test through FastAPI
cd Backend
uvicorn ai.main:app --reload
# Test via Postman/curl
```

### Step 7: Verify Frontend Integration
- Start backend server
- Start frontend dev server
- Test website generation flow
- Verify all features work correctly

---

## Risk Assessment & Mitigation

### Risk 1: API Compatibility Issues
**Risk Level:** Medium  
**Mitigation:** 
- OpenAI SDK is well-documented and widely used
- Marketku claims OpenAI compatibility
- Test thoroughly before production deployment

### Risk 2: Model Response Format Changes
**Risk Level:** Low  
**Mitigation:**
- Keep existing prompts and system instructions
- `mk/sonnet-4.5-thinking-agentic` should maintain JSON output
- Validate responses match expected schema

### Risk 3: Performance Differences
**Risk Level:** Low  
**Mitigation:**
- Monitor response times during testing
- Adjust timeout values if needed
- Compare output quality with current system

### Risk 4: API Key Security
**Risk Level:** High (if not handled properly)  
**Mitigation:**
- Use environment variables
- Never commit `.env` files
- Add `.env` to `.gitignore`
- Consider using secrets management in production

---

## Rollback Plan

If migration fails or issues arise:

1. **Restore Groq Dependencies**
   ```bash
   pip uninstall openai python-dotenv
   pip install groq==1.5.0
   ```

2. **Revert Code Changes**
   ```bash
   git checkout HEAD -- Backend/
   ```

3. **Remove Migration Files**
   ```bash
   rm Backend/.env
   rm Backend/ai/api_client.py
   ```

---

## Post-Migration Tasks

### 1. Documentation Updates
- Update README with new API configuration
- Document environment variable setup
- Create developer setup guide

### 2. Monitoring Setup
- Log API response times
- Track error rates
- Monitor token usage
- Set up alerts for failures

### 3. Cost Analysis
- Compare API costs between Groq and Marketku
- Monitor usage patterns
- Optimize token usage if needed

### 4. Performance Optimization
- Cache common requests if applicable
- Optimize prompt engineering
- Fine-tune temperature and token limits

---

## Success Criteria

Migration is successful when:

- ✅ All API calls use Marketku instead of Groq
- ✅ Website generation works correctly
- ✅ Theme generation produces valid output
- ✅ Layout generation functions properly
- ✅ FastAPI endpoints return expected responses
- ✅ Frontend integration works seamlessly
- ✅ No hardcoded API keys remain
- ✅ Environment variables are properly configured
- ✅ Documentation is updated

---

## Timeline Estimate

| Phase | Tasks | Duration |
|-------|-------|----------|
| **Phase 1** | Dependencies + Environment | 30 min |
| **Phase 2** | Create API Client | 1 hour |
| **Phase 3** | Update AI Modules | 1-2 hours |
| **Phase 4** | Testing & Validation | 1-2 hours |
| **Post-Migration** | Documentation + Monitoring | 1 hour |
| **Total** | **4-6 hours** | |

---

## Questions for User Confirmation

Before proceeding with implementation:

1. ✅ **Model Selection:** Confirmed `mk/sonnet-4.5-thinking-agentic`
2. ❓ **API Key:** Do you have the complete Marketku API key ready?
3. ❓ **Testing:** Do you want to test on a separate branch first?
4. ❓ **Legacy File:** Should we remove [`groq_api_request.py`](Backend/ai/groq_api_request.py:1)?
5. ❓ **Deployment:** Is this for local development or production deployment?

---

## Next Steps

Once approved, switch to **Code mode** to:
1. Create the centralized API client
2. Update all AI modules
3. Test the integration
4. Update documentation

**Ready to proceed with implementation?**
