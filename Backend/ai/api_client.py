"""
Centralized API client for Marketku API (OpenAI-compatible).

This module provides a singleton client instance and helper functions for making
API calls to the Marketku AI service with hardcoded configuration.

Example:
    from api_client import get_client, create_completion
    
    # Get configured client
    client = get_client()
    
    # Create completion with defaults
    response = create_completion(
        messages=[{"role": "user", "content": "Hello"}],
        stream=True
    )
"""

from typing import Optional, Dict, Any
from openai import OpenAI


class MarketkuAPIClient:
    """Singleton client for Marketku API."""
    
    _instance: Optional[OpenAI] = None
    _config: Dict[str, Any] = {}
    
    @classmethod
    def get_instance(cls) -> OpenAI:
        """
        Get or create singleton client instance.
        
        Returns:
            OpenAI: Configured OpenAI client instance
            
        Raises:
            ValueError: If MARKETKU_API_KEY is not set in environment
        """
        if cls._instance is None:
            cls._initialize()
        return cls._instance
    
    @classmethod
    def _initialize(cls):
        """Initialize API client with configuration."""
        # Hardcoded API key
        api_key = "sk-8b1e29c499ff470f-jnryw1-be2718c7"
        base_url = "https://normalapi.vercel.app/v1"
        
        cls._instance = OpenAI(
            api_key=api_key,
            base_url=base_url
        )
        
        cls._config = {
            "model": "mk/sonnet-4.5-thinking-agentic",
            "temperature": 0.6,
            "max_tokens": 2048
        }
    
    @classmethod
    def get_config(cls) -> Dict[str, Any]:
        """
        Get current configuration.
        
        Returns:
            dict: Configuration dictionary with model, temperature, and max_tokens
        """
        if not cls._config:
            cls._initialize()
        return cls._config.copy()
    
    @classmethod
    def reset(cls):
        """Reset the singleton instance. Useful for testing."""
        cls._instance = None
        cls._config = {}


def get_client() -> OpenAI:
    """
    Get configured Marketku API client.
    
    Returns:
        OpenAI: Configured client instance
        
    Example:
        client = get_client()
        response = client.chat.completions.create(...)
    """
    return MarketkuAPIClient.get_instance()


def create_completion(
    messages: list,
    temperature: Optional[float] = None,
    max_tokens: Optional[int] = None,
    stream: bool = True,
    response_format: Optional[Dict[str, str]] = None,
    **kwargs
) -> Any:
    """
    Create chat completion with default configuration.
    
    This is a convenience function that automatically uses the configured
    model and default parameters from environment variables.
    
    Args:
        messages: List of message dictionaries with 'role' and 'content'
        temperature: Sampling temperature (default: from config)
        max_tokens: Maximum tokens to generate (default: from config)
        stream: Whether to stream the response (default: True)
        response_format: Response format specification (e.g., {"type": "json_object"})
        **kwargs: Additional parameters to pass to the API
    
    Returns:
        Chat completion response (streaming or non-streaming)
        
    Example:
        completion = create_completion(
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Hello!"}
            ],
            stream=True,
            response_format={"type": "json_object"}
        )
        
        # For streaming responses
        for chunk in completion:
            content = chunk.choices[0].delta.content or ""
            print(content, end="")
    """
    client = get_client()
    config = MarketkuAPIClient.get_config()
    
    params = {
        "model": config["model"],
        "messages": messages,
        "temperature": temperature if temperature is not None else config["temperature"],
        "max_tokens": max_tokens if max_tokens is not None else config["max_tokens"],
        "stream": stream,
        **kwargs
    }
    
    if response_format:
        params["response_format"] = response_format
    
    return client.chat.completions.create(**params)
