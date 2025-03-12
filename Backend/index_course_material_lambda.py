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
    """Indexes course material into Elasticsearch with vector embeddings."""
    link = event['link']
    content_type = event['type']
    content = event['content']

    if "Error" in content_type:
        print(f"❌ Skipping indexing due to error: {content_type}")
        return

    # Generate vector embeddings
    content_vector = model.encode(content).tolist()
    query_vector = model.encode(event['query']).tolist()

    # Prepare document for indexing
    doc = {
        'link': link,
        'type': content_type,
        'prompt': event['query'],
        'prompt_vector': query_vector,
        'content': content,
        'content_vector': content_vector
    }

    # Index the document
    es.index(index="course_resources", body=doc)
    print(f"✅ Indexed document: {link}")
    
    api_response = {
        'messageVersion': '1.0', 
        'response': {
            'actionGroup': event['actionGroup'],
            'apiPath': event['apiPath'],
            'httpMethod': event['httpMethod'],
            'httpStatusCode': 200,
            'responseBody': {
                'application/json': {
                    'body': f"Succesfully indexed document: {link}"
                }
            }
        },
        'sessionAttributes': event['sessionAttributes'],
        'promptSessionAttributes': event['promptSessionAttributes']
    }
    return api_response