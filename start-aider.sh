#!/bin/bash
export OPENAI_API_KEY="sk-8b1e29c499ff470f-f7zw3y-d9e7e286"
export OPENAI_API_BASE="https://router.marketku.id/v1"

# Drop redundant flags and specify model directly
aider --model openai/mk/sonnet-4.5-thinking-agentic \
      --no-show-model-warnings