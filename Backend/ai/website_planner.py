import json
from api_client import create_completion



SYSTEM_PROMPT = """

You are a website architecture planner.

Convert a user business description into a component tree.

Only output JSON.

Available components:

Page
Container
Section
Grid
Stack
Heading
Paragraph
Text
Image
Button
Navbar
Hero
Card
FeatureList
Gallery
ContactForm
Stats
FAQ
Footer
Timeline
CDNIcon


Every component format:

{
"type":"",
"props":{},
"children":[]
}


Rules:

1. Root must be Page.

2. Only use available components.

3. Do not generate CSS classes, style objects, stylesheet code, colours,
   typography, spacing, or other presentation decisions. A separate theme
   designer will create all visual styling after this content plan is complete.

4. Do not generate HTML.

5. Output JSON only.

6. Do not add unnecessary components.

7. Use these exact prop shapes for collection components:
   - Navbar: {"items": ["Home", "About"]}
   - FeatureList: {"items": ["Feature one", "Feature two"]}. Use strings only.
   - Gallery: {"images": ["https://..."]}
   - Stats: {"items": [{"label": "Trips", "value": "120"}]}
   - FAQ: {"items": [{"question": "...", "answer": "..."}]}
   - Timeline: {"items": [{"year": "2026", "title": "...", "description": "..."}]}

8. Use relevant online images to make the website feel complete. For every Hero,
   Card, Image, or Gallery image prop, provide a real, direct HTTPS image URL from
   a reputable image host such as images.unsplash.com. Never use placeholders,
   bracketed labels, local file paths, data URLs, or invented domains.

9. Image props must use this shape:
   {"src": "https://images.unsplash.com/...", "alt": "Concise description"}
   Include alt text that describes the image. Image sizing and cropping are
   handled by the component and the separate theme designer.

10. For Gallery.images, use 3 to 6 distinct, relevant direct HTTPS image URLs.
    Prefer landscape images for Hero and Gallery sections. Add Unsplash URL
    parameters when appropriate: ?auto=format&fit=crop&w=1600&q=80.

11. Put all content in props, never in children. Children may contain component
    objects only. Use these prop shapes:
    - Heading: {"text": "Section title", "level": 2}
    - Paragraph: {"text": "Supporting copy"}
    - Text: {"text": "Short text"}
    - Button: {"text": "Call to action", "link": "#contact"}
    - Hero: {"title": "...", "subtitle": "...", "buttonText": "...",
      "buttonAction": "#contact", "image": "https://images.unsplash.com/..."}
    - Card: {"title": "...", "description": "...", "image":
      "https://images.unsplash.com/...", "buttonText": "Learn more"}

13. Layout guidance (important):
        - Prefer creating varied layouts using `Grid`, `Section`, and `Container` so
            pages are not a single vertical stack. Use `Grid` for side-by-side
            arrangements (e.g., two-column hero with image + content, multi-card
            grids, or a sidebar + content layout).
        - For `Grid` components use the prop shape `{"columns": <number>}` to
            indicate column count (do not include styling such as gap, widths, or
            CSS). For simple two-column hero sections, prefer `columns: 2` with the
            image on one side and `Heading`/`Paragraph`/`Stats` on the other.
        - Use `Stack` for vertical groupings and `Container` to denote logical
            wrappers. Vary navbar/footer placement only when it improves UX (for
            example a floating navbar or a centered hero with a left sidebar).
        - Do not output presentation CSS or colors here; give only structural
         /layout hints using the approved prop shapes.

12. For `CDNIcon` use direct HTTPS SVG URLs hosted on reputable CDNs (for
        example `jsdelivr`, `unpkg`, or `cdn.jsdelivr.net`). Provide an explicit
        `src` that is a direct SVG file URL. Avoid data URLs or inline SVG strings.
        Example shape: {"src": "https://cdn.jsdelivr.net/npm/heroicons@2.0.13/24/solid/heart.svg", "alt": "Heart icon", "size": 24}

"""


def create_layout(user_prompt, file_urls=None, file_texts=None, image_urls=None):
    """
    Create website layout using AI with optional file and image inputs.
    
    Args:
        user_prompt: User's website description
        file_urls: List of all uploaded file URLs
        file_texts: Dict mapping file URLs to extracted text content
        image_urls: List of image URLs to send to Claude's vision API
    """
    # Build the messages list with multimodal support for images
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
    ]
    
    # Build user message content - use multimodal format if images present
    if image_urls and len(image_urls) > 0:
        # Multimodal message with text + images
        user_content = [
            {"type": "text", "text": user_prompt}
        ]
        
        # Add each image as an image_url block
        # Convert relative URLs to full URLs for API compatibility
        for img_url in image_urls[:10]:  # Limit to 10 images to avoid huge prompts
            # If URL is relative, convert to full URL
            if img_url.startswith("/"):
                full_url = f"http://localhost:5173{img_url}"
            else:
                full_url = img_url
            
            user_content.append({
                "type": "image_url",
                "image_url": {"url": full_url}
            })
        
        messages.append({
            "role": "user",
            "content": user_content
        })
    else:
        # Simple text-only message
        messages.append({
            "role": "user",
            "content": user_prompt
        })


    if file_urls:
        file_list_text = "\n".join(file_urls)
        messages.append({
            "role": "user",
            "content": (
                "Attached files are available and may be used for images or icons. "
                "Use these exact paths/URLs when setting Image or CDNIcon `src` props. "
                "If you include them, use the prop shape specified in the system prompt.\nFiles:\n" + file_list_text
            ),
        })

    # If we have extracted text from any uploaded files, include it as a separate
    # note so the model can use the text when generating content. Keep this
    # separate from the file URLs to avoid instructing the model to 'read'
    # binary attachments directly.
    if file_texts:
        for url, text in (file_texts.items() if isinstance(file_texts, dict) else []):
            # Truncate long extracted text to keep prompt size reasonable.
            snippet = (text or "").strip()[:2500]
            messages.append({
                "role": "user",
                "content": f"Extracted text from {url}:\n{snippet}"
            })

    completion = create_completion(
        messages=messages,
        temperature=0.6,
        max_tokens=2048,
        response_format={"type": "json_object"},
        stream=True,
        top_p=0.95,
        reasoning_effort="default",
        stop=None,
    )

    # Accumulate streamed chunks
    text = ""
    for chunk in completion:
        try:
            text += chunk.choices[0].delta.content or ""
        except Exception:
            try:
                text += chunk.choices[0].message.content or ""
            except Exception:
                continue

    # Try several strategies to parse JSON from the model output.
    data = None
    # 1) Direct parse
    try:
        data = json.loads(text)
    except Exception:
        data = None

    # 2) Extract first JSON object substring (in case model included commentary)
    if data is None:
        try:
            first = text.index("{")
            last = text.rindex("}")
            candidate = text[first:last+1]
            data = json.loads(candidate)
        except Exception:
            data = None

    # 3) As a last resort try to find a JSON object via simple bracket matching
    if data is None:
        try:
            depth = 0
            start = None
            end = None
            for i, ch in enumerate(text):
                if ch == '{':
                    if start is None:
                        start = i
                    depth += 1
                elif ch == '}' and start is not None:
                    depth -= 1
                    if depth == 0:
                        end = i
                        break
            if start is not None and end is not None:
                candidate = text[start:end+1]
                data = json.loads(candidate)
        except Exception:
            data = None

    if not isinstance(data, dict):
        # Raise a clear error so the API layer can return a helpful message.
        raise ValueError(f"Failed to validate JSON. Please adjust your prompt. Model output (truncated): {text[:1000]!s}")

    # Attempt to generate responsive layout info for this component tree and
    # attach it to the saved JSON so the frontend can consume both structure
    # and layout hints in a single file.
    try:
        import layout_designer
        layout = layout_designer.create_responsive_layout(data)
        data_with_layout = {"website": data, "layout": layout}
    except Exception:
        data_with_layout = {"website": data}

    with open(
        "../../ai-website-builder/src/generated_website.json",
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            data_with_layout,
            file,
            indent=2,
            ensure_ascii=False
        )


    print("✅ Website JSON generated successfully!")
    print("📁 File: generated_website.json")

    return data


def create_design():
    #check out how design rules should defind
    #plan all of the possible rules
    print("")