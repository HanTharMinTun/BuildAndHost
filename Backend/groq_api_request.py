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
    api_key="xxx"
)


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


SYSTEM_PROMPT = f"""

You are an AI website architecture planner.

Your job:

Convert user website descriptions into a JSON component tree.

You DO NOT write:
- HTML
- CSS
- React
- JavaScript

You ONLY output JSON.

Available Components:

{COMPONENT_TEMPLATE}


Rules:

1. Only use components from the list.

2. Every component must have this format:


{{
"type":"ComponentName",

"props":{{}},

"children":[]
}}


3. The root must always be:

{{
"type":"Page"
}}


4. Choose components suitable for the user's purpose.

5. Do not create unnecessary components.

6. Keep the structure clean.

7. Output ONLY JSON.

No markdown.
No explanation.

"""


user_prompt = """
Create a bussiness website for a coffeeshop.
"""


completion = client.chat.completions.create(
    model="openai/gpt-oss-120b",

    temperature=0.1,

    max_completion_tokens=4096,

    response_format={
        "type":"json_object"
    },

    messages=[

        {
            "role":"system",
            "content":SYSTEM_PROMPT
        },

        {
            "role":"user",
            "content":user_prompt
        }

    ]
)


result = completion.choices[0].message.content


website_tree = json.loads(result)



# Save JSON file

with open(
    "../ai-website-builder/src/generated_website.json",
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