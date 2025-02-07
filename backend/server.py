from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI

app = FastAPI()

# Enable CORS to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (Change this to your frontend URL in production)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)



client = OpenAI(
  base_url="https://openrouter.ai/api/v1",
  api_key="sk-or-v1-8634",
)


class MessageRequest(BaseModel):
    text: str

@app.post("/chat")
async def chat(request: MessageRequest):
    user_message = request.text

    response = client.chat.completions.create(
        model="deepseek/deepseek-r1:free",
        messages=[
            {
                "role": "user",
                "content": f"""You are an AI specialized in medical text summarization and extraction of key details. 
                            Your task is to break down and summarize the input text into a structured, easy-to-read list while retaining clinical context and critical information.
                            Do not output any information that is not included in the user input. Stick to the user input strictly, at all costs. 
                            Organize the output as follows:

                            1. **Issues/Concerns:**  
                            - Summarize key concerns from within the user input STRICTLY. 

                            2. **Symptoms:**  
                            - List symptoms clearly AS MENTIONED IN THE USER INPUT.

                            3. **Relevant Medical History:**  
                            - Include past conditions or medications, if any, AS MENTIONED IN THE USER INPUT. 

                            4. **Questions/Requests:**  
                            - Extract user queries FROM THE USER INPUT. 

                            Use proper markdown formatting with bullet points and bold section titles.

                            Now, summarize the following input:
                            {user_message}"""



            }
        ]
    )

    print(user_message)
    bot_reply = response.choices[0].message.content
    return {"response": bot_reply}
