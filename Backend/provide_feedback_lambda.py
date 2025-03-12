import google.generativeai as genai
from elasticsearch import Elasticsearch
from sentence_transformers import SentenceTransformer
import os

# Gmail API Scopes
SCOPES = ["https://www.googleapis.com/auth/gmail.send"]

# Configure Google Gemini API
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

# Initialize Elasticsearch
es = Elasticsearch(
    [os.environ.get("ELASTIC_SEARCH_URL")],
    api_key=os.environ.get("ELASTIC_SEARCH_API_KEY"),
    request_timeout=20,
    max_retries=3,
    retry_on_timeout=True
)

# Initialize SentenceTransformer model for vector search
model = SentenceTransformer('all-MiniLM-L6-v2')


def lambda_handler(event, context):
    """Provides feedback using retrieved materials."""
    prompt = f"""
    Given the question:

    {event["question_text"]}

    The student's answer:

    {event["student_answers"]}

    The relevant course materials:

    {event["course_materials"]}

    Provide constructive feedback to help the student improve.
    """

    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(prompt)
    api_response = {
        'messageVersion': '1.0', 
        'response': {
            'actionGroup': event['actionGroup'],
            'apiPath': event['apiPath'],
            'httpMethod': event['httpMethod'],
            'httpStatusCode': 200,
            'responseBody': {
                'application/json': {
                    'body': f"{response.text}"
                }
            }
        },
        'sessionAttributes': event['sessionAttributes'],
        'promptSessionAttributes': event['promptSessionAttributes']
    }
    return api_response