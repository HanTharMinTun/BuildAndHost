from openai import OpenAI

client = OpenAI(
    base_url="https://router.marketku.id/v1",
    api_key="sk-8b1e29c499ff470f-f7zw3y-d9e7e286",
)

response = client.chat.completions.create(
    model="mk/sonnet-4.5-thinking-agentic",
    messages=[
        {"role": "user", "content": "Hello! Give me a short introduction."}
    ],
)

print(response.choices[0].message.content)