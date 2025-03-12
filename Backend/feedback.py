import google.generativeai as genai
from elasticsearch import Elasticsearch
from sentence_transformers import SentenceTransformer
import os, base64
from dotenv import load_dotenv
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from email.mime.text import MIMEText

from parse import main as parse_docs

load_dotenv()

# Gmail API Scopes
SCOPES = ["https://www.googleapis.com/auth/gmail.send"]

# Configure Google Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Initialize Elasticsearch
es = Elasticsearch(
    [os.getenv("ELASTIC_SEARCH_URL")],
    api_key=os.getenv("ELASTIC_SEARCH_API_KEY"),
    request_timeout=20,
    max_retries=3,
    retry_on_timeout=True
)

# Initialize SentenceTransformer model for vector search
model = SentenceTransformer('all-MiniLM-L6-v2')

def index_course_material(data, query):
    """Indexes course material into Elasticsearch with vector embeddings."""
    link = data['link']
    content_type = data['type']
    content = data['content']

    if "Error" in content_type:
        print(f"❌ Skipping indexing due to error: {content_type}")
        return

    # Generate vector embeddings
    content_vector = model.encode(content).tolist()
    query_vector = model.encode(query).tolist()

    # Prepare document for indexing
    doc = {
        'link': link,
        'type': content_type,
        'prompt': query,
        'prompt_vector': query_vector,
        'content': content,
        'content_vector': content_vector
    }

    # Index the document
    es.index(index="course_resources", body=doc)
    print(f"✅ Indexed document: {link}")

def authenticate_gmail():
    """Authenticate with Gmail API and return a Gmail service instance."""
    creds = None

    # Check if token.json exists
    if os.path.exists("token.json"):
        creds = Credentials.from_authorized_user_file("token.json", SCOPES)

    # If no valid credentials, run OAuth authentication
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file("credentials.json", SCOPES)
            creds = flow.run_local_server(port=0)  # Opens browser for login

        # Save the credentials for future use
        with open("token.json", "w") as token:
            token.write(creds.to_json())

    return build("gmail", "v1", credentials=creds)

def send_email(student_email, student_name, grade, feedback):
    """Sends a well-formatted email with grading results and feedback."""
    service = authenticate_gmail()

    subject = "📚 Your Quiz/Assignment Grading Results"

    # Convert feedback newlines to HTML <br><br> for proper spacing
    formatted_feedback = feedback.replace("\n", "<br><br>")

    email_body = (
        "<html>"
        "<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px;'>"

        # Student Greeting
        f"<p style='font-size: 16px;'>Hi <strong>{student_name}</strong>,</p>"
        "<p style='font-size: 16px;'>Here is your grading result:</p>"

        # Grade Section
        "<h2 style='color: #2E86C1;'>📌 Final Grade</h2>"
        f"<p style='font-size: 18px; font-weight: bold;'> {grade} / 10</p>"

        "<hr style='border: 1px solid #ddd;'>"

        # Feedback Section
        "<h3 style='color: #1D8348;'>📝 Feedback</h3>"
        f"<p style='font-size: 14px; text-align: justify;'>{formatted_feedback}</p>"

        "<hr style='border: 1px solid #ddd;'>"

        # Closing Message
        "<p style='font-size: 14px;'>If you have any questions, feel free to reach out.</p>"
        "<p style='font-size: 14px;'><strong>Best regards,</strong><br>"
        "Course Grading Team 🎓</p>"

        "</body>"
        "</html>"
    )

    # Create Email Message
    message = MIMEText(email_body, "html")  # Set content type to HTML for formatting
    message["to"] = student_email
    message["subject"] = subject
    raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()

    # Send Email
    try:
        send_message = (
            service.users().messages().send(userId="me", body={"raw": raw_message}).execute()
        )
        print(f"✅ Email sent successfully to {student_email}")
        return send_message
    except Exception as e:
        print(f"❌ Failed to send email: {e}")
        return None

def extract_text_from_source(file_or_link):
    """Extracts text from a given file path or link."""
    return parse_docs(file_or_link)

def retrieve_relevant_material(question_text):
    """Retrieves top relevant course materials from Elasticsearch using similarity search."""
    query_vector = model.encode(question_text).tolist()
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
    return [hit["_source"]["content"] for hit in response["hits"]["hits"]]

def grade_answers(question_text, rubric, student_answers, course_materials):
    """Uses Google Gemini API to grade answers based on rubric and retrieved materials."""
    prompt = f"""
    Given the following quiz/exam question:

    {question_text}

    The rubric for grading:

    {rubric}

    The student's answer:

    {student_answers}

    The relevant course materials:

    {course_materials}

    Please provide a grade (scale of 0-10) and a justification.
    """

    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(prompt)
    return response.text

def provide_feedback(question_text, student_answers, course_materials):
    """Provides feedback using retrieved materials."""
    prompt = f"""
    Given the question:

    {question_text}

    The student's answer:

    {student_answers}

    The relevant course materials:

    {course_materials}

    Provide constructive feedback to help the student improve.
    """

    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(prompt)
    return response.text

def main(question_source, answer_source, student_email, student_name):
    """Main function: extracts text, retrieves materials, grades, and sends email feedback."""
    question_data = extract_text_from_source(question_source)
    student_data = extract_text_from_source(answer_source)

    if "Error" in question_data["type"] or "Error" in student_data["type"]:
        print("❌ Error extracting text from one or both sources.")
        return

    question_text = question_data["content"]
    student_answers = student_data["content"]

    # Extract rubric from the question paper (assuming it's at the end of the file)
    rubric = question_text.split("Rubric:")[-1] if "Rubric:" in question_text else "No rubric provided."

    # Retrieve relevant course materials
    course_materials = retrieve_relevant_material(question_text)

    # Grade the answer
    grade = grade_answers(question_text, rubric, student_answers, course_materials)

    # Provide feedback
    feedback = provide_feedback(question_text, student_answers, course_materials)

    # Send results via email
    send_email(student_email, student_name, grade, feedback)

    # Output to console
    print("\n--- Grading Results Sent ---\n")
    print(f"✅ Grade: {grade}")
    print(f"✅ Feedback: {feedback}")

# Example usage
if __name__ == "__main__":
    scraped_data = {
        "link": "https://web.stanford.edu/class/archive/cs/cs111/cs111.1254/lectures/5/Lecture5.pdf",
        "type": "pdf",
        "content": "Crash Recovery in File Systems, block caching, ordered writes, fsck checks..."
    }
    # index_course_material(scraped_data, "I am in a course CS111 at Stanford. I am confused about lecture 10.")
    main(
        "Documents/Questions.docx",  # Path to question paper
        "Documents/Answers.docx",  # Path to student's answer script
        "stellak1@asu.edu",  # Student email
        "Sujith Ramprasad Tellakula"  # Student name
    )