from openai import OpenAI
from dotenv import load_dotenv
import os
from pydantic import BaseModel
import json

load_dotenv()

client = OpenAI(api_key=os.getenv('PERPLEXITY_API_KEY'), base_url="https://api.perplexity.ai")

class Resources(BaseModel):
    free_resources: list[str]
    paid_resources: list[str]

class ASUResource(BaseModel):
    type: str
    link: str
    text: str

def parse_json_garbage(s):
    s = s[next(idx for idx, c in enumerate(s) if c in "{["):]
    try:
        return json.loads(s)
    except json.JSONDecodeError as e:
        return json.loads(s[:e.pos])

def get_external_resources(topic: str) -> dict | str:
    response = client.chat.completions.create(
        model="sonar-pro",
        messages = [
            {
                "role": "system", 
                "content": f"You are to return resource links based on the prompt. Get the links from Udemy, Youtube, and other reputed sites. Do not include any other text in your response including 'Here is a list of suggested resources to learn XXX:'. Make sure that the links returned are specific to the prompt. Return the list of links as a list in the following json schema: {Resources.model_json_schema()}"
            },
            {
                "role": "user",
                "content": f"Suggest some resources to learn {topic}. Provide only the links and nothing else. Return it as a list."
            }
        ]
    )
    output = response.choices[0].message.content.strip()
    try:
        print("Correct")
        return json.loads(output)
    except:
        print("Garbage")
        return parse_json_garbage(output)

def get_asu_resources(prompt: str) -> dict | str:
    response = client.chat.completions.create(
        model="sonar-pro",
        messages = [
            {
                "role": "system", 
                "content": f"You are to return resource links and information based on the prompt. Get the links only from the Arizona State University website, some related Reddit topics and RateMyProfessor. No other links!. The type is either 'link' or 'text', Do not include any other text in your response. Make sure that the links returned are specific to the prompt. Return the list of resources as a list in the following json schema: {ASUResource.model_json_schema()}"
            },
            {
                "role": "user",
                "content": f"{prompt}. Provide me the only the resources that ASU Provides. Provide only the links and nothing else. Return it as a list."
            }
        ]
    )
    output = response.choices[0].message.content.strip()
    try:
        print("Correct")
        return json.loads(output)
    except:
        # print("Garbage")
        return output
    
def get_asu_information(prompt):
    response = client.chat.completions.create(
        model="sonar-pro",
        messages = [
            {
                "role": "system", 
                "content": f"You are to return information based on the prompt. Get the info only from the Arizona State University website, some related Reddit topics and RateMyProfessor. No other links!."
            },
            {
                "role": "user",
                "content": f"{prompt}"
            }
        ]
    )
    return response.choices[0].message.content.strip()

if __name__ == "__main__":
    # print(get_external_resources("Python"))
    # print(get_asu_resources("I need a quiet place to study. Where can I go?"))
    print(get_asu_information("What is the best place to study on campus?"))