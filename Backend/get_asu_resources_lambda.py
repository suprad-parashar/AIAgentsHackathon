from openai import OpenAI
import os
from pydantic import BaseModel

client = OpenAI(api_key=os.environ.get('PERPLEXITY_API_KEY'), base_url="https://api.perplexity.ai")

class Resources(BaseModel):
    free_resources: list[str]
    paid_resources: list[str]

class ASUResource(BaseModel):
    type: str
    link: str
    text: str

def lambda_handler(event, context):
    response = client.chat.completions.create(
        model="sonar-pro",
        messages = [
            {
                "role": "system", 
                "content": f"You are to return resource links and information based on the prompt. Get the links only from the Arizona State University website, some related Reddit topics and RateMyProfessor. No other links!. The type is either 'link' or 'text', Do not include any other text in your response. Make sure that the links returned are specific to the prompt. Return the list of resources as a list in the following json schema: {ASUResource.model_json_schema()}"
            },
            {
                "role": "user",
                "content": f"{event['prompt']}. Provide me the only the resources that ASU Provides. Provide only the links and nothing else. Return it as a list."
            }
        ]
    )
    output = response.choices[0].message.content.strip()
    api_response = {
        'messageVersion': '1.0', 
        'response': {
            'actionGroup': event['actionGroup'],
            'apiPath': event['apiPath'],
            'httpMethod': event['httpMethod'],
            'httpStatusCode': 200,
            'responseBody': {
                'application/json': {
                    'body': f"{output}"
                }
            }
        },
        'sessionAttributes': event['sessionAttributes'],
        'promptSessionAttributes': event['promptSessionAttributes']
    }
    return api_response