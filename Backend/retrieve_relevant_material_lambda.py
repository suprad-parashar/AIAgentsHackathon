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
    """Retrieves top relevant course materials from Elasticsearch using similarity search."""
    query_vector = model.encode(event["question_text"]).tolist()
    query = {
        "query": {
            "script_score": {
                "query": {"match_all": {}},
                "script": {
                    "source": "cosineSimilarity(params.query_vector, 'content_vector') + 1.0",
                    "params": {"query_vector": query_vector}
                }
            }
        },
        "size": 3
    }
    response = es.search(index="course_resources", body=query)
    
    resp = []
    for hit in response["hits"]["hits"]:
        resp.append(hit["_source"]["content"])
    
    api_response = {
        'messageVersion': '1.0', 
        'response': {
            'actionGroup': event['actionGroup'],
            'apiPath': event['apiPath'],
            'httpMethod': event['httpMethod'],
            'httpStatusCode': 200,
            'responseBody': {
                'application/json': {
                    'body': f"{resp}"
                }
            }
        },
        'sessionAttributes': event['sessionAttributes'],
        'promptSessionAttributes': event['promptSessionAttributes']
    }
    return api_response