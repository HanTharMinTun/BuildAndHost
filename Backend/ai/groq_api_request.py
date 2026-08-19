# from groq import Groq

# client = Groq()
# completion = client.chat.completions.create(
#     model="openai/gpt-oss-120b",
#     messages=[
#       {
#         "role": "user",
#         "content": ""
#       }
#     ],
#     temperature=1,
#     max_completion_tokens=2048,
#     top_p=1,
#     reasoning_effort="medium",
#     stream=True,
#     stop=None
# )

# for chunk in completion:
#     print(chunk.choices[0].delta.content or "", end="")


import json
from groq import Groq

client = Groq(
    api_key="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"
)

#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


DESIGN_TEMPLATE = """

Every website must have a theme object.

Theme format:

{
"theme":{
    "colors":{
        "primary":"",
        "secondary":"",
        "background":"",
        "text":""
    },

    "typography":{
        "heading":"",
        "body":""
    },

    "spacing":{
        "small":"",
        "medium":"",
        "large":""
    },

    "borderRadius":""
}
}

"""



COMPONENT_TEMPLATE = """
Page
- Root website container

Container
- Center content wrapper

Section
- Website section

Grid
- Responsive grid layout

Stack
- Vertical layout

Heading
- Large text heading
Required:
text

Paragraph
- Normal paragraph text
Required:
text

Text
- Small text

Image
- Image component
Required:
src

Button
- Interactive button
Required:
text

Navbar
- Navigation bar
Required:
items

Hero
- Hero landing section
Required:
title

Optional:
subtitle
buttonText
buttonAction
image


Card
- Content card
Required:
title

Optional:
description
image
buttonText


FeatureList
- Feature collection
Required:
items


Timeline
- Timeline component
Required:
items


Gallery
- Image gallery
Required:
images


ContactForm
- Contact form


Stats
- Statistics section
Required:
items


FAQ
- Frequently asked questions
Required:
items


Footer
- Website footer


Divider
- Separator
"""

DESIGN_TEMPLATE = """

Every website must have a theme object.

Theme format:

{
"theme":{
    "colors":{
        "primary":"",
        "secondary":"",
        "background":"",
        "text":""
    },

    "typography":{
        "heading":"",
        "body":""
    },

    "spacing":{
        "small":"",
        "medium":"",
        "large":""
    },

    "borderRadius":""
}
}

"""


COMPONENT_FORMAT = """

Every component must have this format:

{
"type":"ComponentName",

"props":{},

"style":{},

"children":[]
}

style contains visual customization.

Allowed style properties:

{
"backgroundColor":"",
"color":"",
"padding":"",
"margin":"",
"width":"",
"height":"",
"fontSize":"",
"fontWeight":"",
"textAlign":"",
"borderRadius":"",
"display":"",
"gap":""
}

Do not use CSS syntax.
Do not create class names.
Do not write selectors.

"""


STYLE_RULES = """

Style rules:

Hero:
- Always include padding.
- Usually include text alignment.

Button:
- Always include:
    backgroundColor
    color
    padding
    borderRadius

Card:
- Include:
    padding
    borderRadius
    backgroundColor

Section:
- Include:
    padding
    margin

Grid:
- Include:
    display
    gap

"""




SYSTEM_PROMPT = f"""

You are an AI website architecture planner.

Convert user descriptions into a JSON component tree.

You ONLY output JSON.

No HTML.
No CSS.
No React.
No JavaScript.


Available Components:

{COMPONENT_TEMPLATE}


Design System:

{DESIGN_TEMPLATE}


Component Format:

{COMPONENT_FORMAT}


Style Rules:

{STYLE_RULES}


Rules:

1. Only use available components.

2. Root must always be Page.

3. Every component requires:
"type"
"props"
"style"
"children"

4. Use theme colors instead of random colors.

5. Keep design consistent.

6. Output ONLY JSON.

"""




# SYSTEM_PROMPT = f"""

# You are an AI website architecture planner.

# Your job:

# Convert user website descriptions into a JSON component tree.

# You DO NOT write:
# - HTML
# - CSS
# - React
# - JavaScript

# You ONLY output JSON.

# Available Components:

# {COMPONENT_TEMPLATE}


# Rules:

# 1. Only use components from the list.

# 2. Every component must have this format:


# {{
# "type":"ComponentName",

# "props":{{}},

# "children":[]
# }}


# 3. The root must always be:

# {{
# "type":"Page"
# }}


# 4. Choose components suitable for the user's purpose.

# 5. Do not create unnecessary components.

# 6. Keep the structure clean.

# 7. Output ONLY JSON.

# No markdown.
# No explanation.

# """


# user_prompt = """
# Create a bussiness website for a coffeeshop.
# """

def generate_json(user_prompt: str):

    completion = client.chat.completions.create(
        model="qwen/qwen3.6-27b",
        messages=[{"role": "system", "content": SYSTEM_PROMPT}, {"role": "user", "content": user_prompt}],
        temperature=0.6,
        max_completion_tokens=2048,
        top_p=0.95,
        reasoning_effort="default",
        response_format={"type": "json_object"},
        stream=True,
        stop=None,
    )

    # Accumulate streamed text chunks
    text = ""
    for chunk in completion:
        try:
            text += chunk.choices[0].delta.content or ""
        except Exception:
            try:
                text += chunk.choices[0].message.content or ""
            except Exception:
                continue

    website_tree = {}
    try:
        website_tree = json.loads(text)
    except Exception:
        website_tree = {}



    # Save JSON file

    with open(
        "../../ai-website-builder/src/generated_website.json",
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            website_tree,
            file,
            indent=2,
            ensure_ascii=False
        )


    print("✅ Website JSON generated successfully!")
    print("📁 File: generated_website.json")