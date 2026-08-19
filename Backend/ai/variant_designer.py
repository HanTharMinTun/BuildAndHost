import json
from groq import Groq


client=Groq(
    api_key="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"
)



SYSTEM_PROMPT="""

You are a website style variant designer.

Create different visual variants.

Output JSON only.


Format:

{

"variants":[

{
"name":"",
"description":"",
"changes":{}
}

]

}


Create 3 variants.


"""


def create_variants(user_prompt):


    completion = client.chat.completions.create(
        model="qwen/qwen3.6-27b",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.6,
        max_completion_tokens=2048,
        top_p=0.95,
        reasoning_effort="default",
        response_format={"type": "json_object"},
        stream=True,
        stop=None,
    )

    text = ""
    for chunk in completion:
        try:
            text += chunk.choices[0].delta.content or ""
        except Exception:
            try:
                text += chunk.choices[0].message.content or ""
            except Exception:
                continue

    try:
        return json.loads(text)
    except Exception:
        return {}