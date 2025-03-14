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
    return output
    # try:
    #     return json.loads(output)
    # except:
    #     return output

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
    return output
    # try:
    #     return json.loads(output)
    # except:
    #     return output
    
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
    output = response.choices[0].message.content.strip()
    return output

def get_response_from_links(prompt, links_info):
    response = client.chat.completions.create(
        model="sonar-pro",
        messages = [
            {
                "role": "system", 
                "content": f"You will respond to the prompt only using the information provided in the links. Do not include any other text in your response. Make sure that the response is specific to the prompt."
            },
            {
                "role": "user",
                "content": f"Prompt: {prompt}\nLinks: {links_info}"
            }
        ]
    )
    output = response.choices[0].message.content.strip()
    return output

def get_type(prompt):
    response = client.chat.completions.create(
        model="sonar-pro",
        messages = [
            {
                "role": "system", 
                "content": f"Return 'ASU' if the prompt is related to getting information from ASU. If the prompt is related to getting external resources, return 'External'. Do not return anything else apart from ['ASU', 'External']."
            },
            {
                "role": "user",
                "content": f"{prompt}. Is this prompt related to ASU or External resources? Return 'ASU' or 'External'."
            }
        ]
    )
    output = response.choices[0].message.content.strip()
    return output

def workflow(prompt):
    type = get_type(prompt)
    if "ASU".lower() in type.lower():
        links = get_asu_resources(prompt)
    elif "External".lower() in type.lower():
        links = get_external_resources(prompt)

    response = get_response_from_links(prompt, links)
    return response

if __name__ == "__main__":
    # print(get_type("I need a quiet place to study. Where can I go?"))
    # print(get_type("What are some nice resources to learn Python?"))
    print(workflow("What are some nice resources to learn Python?"))
    # print(get_external_resources("Python"))
    # print(get_asu_resources("I need a quiet place to study. Where can I go?"))
    # print(get_asu_information("What is the best place to study on campus?"))