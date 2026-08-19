"""Second AI pass: turn a content-only website plan into safe theme tokens."""

import json
import os
from groq import Groq


THEME_SELECTORS = [
    ".ai-site", ".component-page", ".component-navbar", ".component-hero",
    ".component-section", ".component-heading", ".component-paragraph",
    ".component-button", ".component-card", ".component-featurelist",
    ".component-gallery", ".component-gallery img", ".component-contactform", ".component-stats",
    ".component-faq", ".component-footer",
]

ALLOWED_PROPERTIES = {
    "backgroundColor", "backgroundImage", "color", "fontFamily", "fontSize",
    "fontWeight", "lineHeight", "letterSpacing", "borderColor", "borderRadius",
    "borderWidth", "boxShadow", "padding", "margin", "gap", "maxWidth",
    "minHeight", "height", "width", "objectFit", "textAlign", "display",
    "gridTemplateColumns", "justifyContent", "alignItems", "opacity",
    # Simple animation and interaction props allowed (transitions and transforms).
    "transition", "transform",
}

SYSTEM_PROMPT = f"""
You are the second pass in an AI website builder. The first pass has already
created the content and component tree. Create a coherent, responsive visual
theme for that exact website.

Return JSON only in this exact format:
{{
    "theme": {{
        "name": "short descriptive name",
        "styles": {{
            ".ai-site": {{"backgroundColor": "#...", "color": "#...", "fontFamily": "..."}},
            ".component-hero": {{"backgroundColor": "#...", "borderRadius": "..."}}
        }}
    }}
}}

Selectors and interaction rules:
- You may use ONLY these base selectors: {", ".join(THEME_SELECTORS)}.
- You MAY also provide hover/state variants by appending ":hover" to any
    allowed selector (for example ".component-button:hover").
- You MAY include responsive overrides using top-level keys that begin with
    an @media rule, for example "@media (max-width: 768px)": {{ ".component-hero": {{"fontSize": "1.25rem"}} }}.

Allowed properties and interactions:
- Use ONLY these camelCase properties: {", ".join(sorted(ALLOWED_PROPERTIES))}.
- Additionally, simple interaction properties `transition` and `transform`
    are allowed to enable hover animations and subtle motion.

Formatting rules:
- Return plain JSON only. For responsive entries use top-level @media keys
    mapping to nested selector objects (see example above).
- Do NOT return raw CSS strings, CSS variables, @keyframes, or external URLs.
- Keep values simple and safe (short strings or numbers). Avoid long inline
    styles. The frontend will convert this JSON into CSS safely.

Style hints:
- Provide hover states using ":hover" selectors rather than embedding style
    in the component tree. Use `transition` for smooth hover effects and
    `transform` for simple movements (scale/translate/rotate).
- Prefer responsive adjustments using media queries rather than absolute
    pixel sizes so the site adapts to mobile, tablet, and desktop.

Example output:
{{
    "theme": {{
        "name": "Warm Professional",
        "styles": {{
            ".ai-site": {{"backgroundColor": "#0b1220", "color": "#ffffff"}},
            ".component-button": {{"backgroundColor": "#ff7a59", "transition": "transform 200ms ease"}},
            ".component-button:hover": {{"transform": "scale(1.03)"}},
            "@media (max-width: 768px)": {{ ".component-hero": {{"padding": "1rem"}} }}
        }}
    }}
}}
"""



def _client() -> Groq:
    api_key = "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"

    if api_key:
        return Groq(api_key=api_key)

    # Keep the new pass compatible with the existing planner configuration.
    # New deployments should provide GROQ_API_KEY instead of embedding a key.
    from website_planner import client
    return client


def _clean_theme(value: object) -> dict:
    """Keep the AI response within the small CSS surface the frontend supports."""
    theme = value.get("theme", {}) if isinstance(value, dict) else {}
    raw_styles = theme.get("styles", {}) if isinstance(theme, dict) else {}
    styles: dict[str, dict[str, str | int | float]] = {}

    def is_allowed_selector(sel: str) -> bool:
        if sel in THEME_SELECTORS:
            return True
        if sel.endswith(":hover") and sel[:-6] in THEME_SELECTORS:
            return True
        return False

    if isinstance(raw_styles, dict):
        for selector, declarations in raw_styles.items():
            # Support top-level @media blocks with nested selector maps.
            if isinstance(selector, str) and selector.strip().startswith("@media") and isinstance(declarations, dict):
                nested: dict[str, dict[str, str | int | float]] = {}
                for nested_sel, nested_decls in declarations.items():
                    if not isinstance(nested_sel, str) or not is_allowed_selector(nested_sel):
                        continue
                    if not isinstance(nested_decls, dict):
                        continue
                    safe_declarations = {
                        property_name: property_value
                        for property_name, property_value in nested_decls.items()
                        if property_name in ALLOWED_PROPERTIES and isinstance(property_value, (str, int, float))
                    }
                    if safe_declarations:
                        nested[nested_sel] = safe_declarations
                if nested:
                    styles[selector] = nested
                continue

            if not isinstance(selector, str) or not is_allowed_selector(selector) or not isinstance(declarations, dict):
                continue
            safe_declarations = {
                property_name: property_value
                for property_name, property_value in declarations.items()
                if property_name in ALLOWED_PROPERTIES and isinstance(property_value, (str, int, float))
            }
            if safe_declarations:
                styles[selector] = safe_declarations

    return {
        "theme": {
            "name": theme.get("name", "Generated theme") if isinstance(theme, dict) else "Generated theme",
            "styles": styles,
        }
    }


def create_theme(user_prompt: str, website_tree: dict) -> dict:
    # Use streaming API to be compatible with the newer model usage.
    client = _client()
    completion = client.chat.completions.create(
        model="qwen/qwen3.6-27b",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": json.dumps({"brief": user_prompt, "website": website_tree})},
        ],
        temperature=0.6,
        max_completion_tokens=2048,
        top_p=0.95,
        reasoning_effort="default",
        response_format={"type": "json_object"},
        stream=True,
        stop=None,
    )

    # Accumulate streamed chunks into a single text payload.
    text = ""
    for chunk in completion:
        try:
            # `delta` may be present in streaming chunks
            text += chunk.choices[0].delta.content or ""
        except Exception:
            # Some chunks may carry full message.content on older SDKs
            try:
                text += chunk.choices[0].message.content or ""
            except Exception:
                continue

    # Parse and sanitize the returned theme JSON.
    try:
        parsed = json.loads(text)
    except Exception:
        parsed = {}
    return _clean_theme(parsed)
