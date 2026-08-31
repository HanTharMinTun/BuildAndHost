"""
AI Service for theme generation using Marketku API
"""
import json
import sys
import os
from typing import Dict, Any, Optional

# Add Backend directory to path to import ai.api_client
backend_path = os.path.join(os.path.dirname(__file__), '..', '..', '..')
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from ai.api_client import create_completion


THEME_SYSTEM_PROMPT = """
You are an AI design system specialist that generates CSS theme configurations for websites.

Your task is to analyze a website's component structure and create a cohesive, modern theme with appropriate colors, typography, spacing, and animations.

You will receive:
- A brief describing the desired theme style
- The complete website JSON structure showing all components

You must output ONLY valid JSON in this exact format:

{
  "name": "Theme Name",
  "styles": {
    "colors": {
      "primary": "#hex",
      "secondary": "#hex",
      "accent": "#hex",
      "background": "#hex",
      "surface": "#hex",
      "text": "#hex",
      "textSecondary": "#hex",
      "border": "#hex",
      "success": "#hex",
      "warning": "#hex",
      "error": "#hex"
    },
    "typography": {
      "fontFamily": "font name",
      "headingFont": "font name",
      "fontSize": {
        "base": "16px",
        "small": "14px",
        "large": "18px",
        "h1": "48px",
        "h2": "36px",
        "h3": "28px",
        "h4": "24px",
        "h5": "20px",
        "h6": "18px"
      },
      "fontWeight": {
        "normal": 400,
        "medium": 500,
        "semibold": 600,
        "bold": 700
      },
      "lineHeight": {
        "tight": 1.25,
        "normal": 1.5,
        "relaxed": 1.75
      }
    },
    "spacing": {
      "xs": "4px",
      "sm": "8px",
      "md": "16px",
      "lg": "24px",
      "xl": "32px",
      "2xl": "48px",
      "3xl": "64px"
    },
    "borderRadius": {
      "none": "0",
      "sm": "4px",
      "md": "8px",
      "lg": "12px",
      "xl": "16px",
      "full": "9999px"
    },
    "shadows": {
      "none": "none",
      "sm": "0 1px 2px rgba(0,0,0,0.05)",
      "md": "0 4px 6px rgba(0,0,0,0.1)",
      "lg": "0 10px 15px rgba(0,0,0,0.1)",
      "xl": "0 20px 25px rgba(0,0,0,0.15)"
    },
    "animations": {
      "duration": {
        "fast": "150ms",
        "normal": "300ms",
        "slow": "500ms"
      },
      "easing": {
        "easeIn": "cubic-bezier(0.4, 0, 1, 1)",
        "easeOut": "cubic-bezier(0, 0, 0.2, 1)",
        "easeInOut": "cubic-bezier(0.4, 0, 0.2, 1)"
      }
    },
    "breakpoints": {
      "mobile": "640px",
      "tablet": "768px",
      "desktop": "1024px",
      "wide": "1280px"
    }
  }
}

Rules:
1. Choose colors that work well together and provide good contrast
2. Select appropriate fonts (use common web-safe fonts or Google Fonts)
3. Ensure spacing values create visual hierarchy
4. Make sure text colors have sufficient contrast against backgrounds (WCAG AA: 4.5:1 for normal text)
5. Consider the website's components when selecting theme values
6. The theme should be modern, professional, and accessible
7. Output ONLY the JSON - no markdown, no explanations, no additional text

Analyze the website structure to understand:
- What components are used (buttons, forms, cards, etc.)
- The overall layout and structure
- The content type (portfolio, business, blog, etc.)

Then generate a theme that complements the website's purpose and structure.
"""


def analyze_website_structure(website_json: Dict[str, Any]) -> str:
    """
    Analyze website structure to provide context for theme generation
    """
    def count_components(node: Dict[str, Any], counts: Dict[str, int]):
        node_type = node.get("type", "Unknown")
        counts[node_type] = counts.get(node_type, 0) + 1
        for child in node.get("children", []):
            count_components(child, counts)
    
    counts = {}
    count_components(website_json, counts)
    
    # Create a summary
    component_summary = "\n".join([f"- {comp}: {count}" for comp, count in counts.items()])
    
    return f"""
Website Structure Analysis:
{component_summary}

This information helps understand what components need styling.
"""


async def generate_theme_with_ai(
    brief: str,
    website_json: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Generate a theme using Groq AI based on the website structure and brief.
    
    Args:
        brief: User's description of desired theme style
        website_json: Complete website component tree
        
    Returns:
        Generated theme dictionary
        
    Raises:
        Exception: If AI generation fails
    """
    try:
        # Analyze website structure
        structure_analysis = analyze_website_structure(website_json)
        
        # Create user prompt with context
        user_prompt = f"""
Theme Brief: {brief}

{structure_analysis}

Website JSON (for context):
{json.dumps(website_json, indent=2)[:2000]}... (truncated for brevity)

Generate a complete theme configuration that matches the brief and works well with this website structure.
"""
        
        # Call Marketku API using the existing client
        completion = create_completion(
            messages=[
                {
                    "role": "system",
                    "content": THEME_SYSTEM_PROMPT
                },
                {
                    "role": "user",
                    "content": user_prompt
                }
            ],
            temperature=0.7,
            max_tokens=2048,
            stream=False,
            response_format={"type": "json_object"}
        )
        
        # Parse response
        result = completion.choices[0].message.content
        theme_data = json.loads(result)
        
        # Validate theme structure
        if "name" not in theme_data:
            theme_data["name"] = "Generated Theme"
        
        if "styles" not in theme_data:
            raise ValueError("Generated theme missing 'styles' field")
        
        return theme_data
        
    except json.JSONDecodeError as e:
        raise Exception(f"Failed to parse AI response as JSON: {str(e)}")
    except Exception as e:
        raise Exception(f"Theme generation failed: {str(e)}")


def get_default_theme() -> Dict[str, Any]:
    """
    Return a safe default theme in case AI generation fails
    """
    return {
        "name": "Default Modern Theme",
        "styles": {
            "colors": {
                "primary": "#6366f1",
                "secondary": "#8b5cf6",
                "accent": "#06b6d4",
                "background": "#ffffff",
                "surface": "#f9fafb",
                "text": "#111827",
                "textSecondary": "#6b7280",
                "border": "#e5e7eb",
                "success": "#10b981",
                "warning": "#f59e0b",
                "error": "#ef4444"
            },
            "typography": {
                "fontFamily": "system-ui, -apple-system, sans-serif",
                "headingFont": "system-ui, -apple-system, sans-serif",
                "fontSize": {
                    "base": "16px",
                    "small": "14px",
                    "large": "18px",
                    "h1": "48px",
                    "h2": "36px",
                    "h3": "28px",
                    "h4": "24px",
                    "h5": "20px",
                    "h6": "18px"
                },
                "fontWeight": {
                    "normal": 400,
                    "medium": 500,
                    "semibold": 600,
                    "bold": 700
                },
                "lineHeight": {
                    "tight": 1.25,
                    "normal": 1.5,
                    "relaxed": 1.75
                }
            },
            "spacing": {
                "xs": "4px",
                "sm": "8px",
                "md": "16px",
                "lg": "24px",
                "xl": "32px",
                "2xl": "48px",
                "3xl": "64px"
            },
            "borderRadius": {
                "none": "0",
                "sm": "4px",
                "md": "8px",
                "lg": "12px",
                "xl": "16px",
                "full": "9999px"
            },
            "shadows": {
                "none": "none",
                "sm": "0 1px 2px rgba(0,0,0,0.05)",
                "md": "0 4px 6px rgba(0,0,0,0.1)",
                "lg": "0 10px 15px rgba(0,0,0,0.1)",
                "xl": "0 20px 25px rgba(0,0,0,0.15)"
            },
            "animations": {
                "duration": {
                    "fast": "150ms",
                    "normal": "300ms",
                    "slow": "500ms"
                },
                "easing": {
                    "easeIn": "cubic-bezier(0.4, 0, 1, 1)",
                    "easeOut": "cubic-bezier(0, 0, 0.2, 1)",
                    "easeInOut": "cubic-bezier(0.4, 0, 0.2, 1)"
                }
            },
            "breakpoints": {
                "mobile": "640px",
                "tablet": "768px",
                "desktop": "1024px",
                "wide": "1280px"
            }
        }
    }
