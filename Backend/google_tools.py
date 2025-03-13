import ast
import os, base64
from dotenv import load_dotenv
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from email.mime.text import MIMEText
from googleapiclient.errors import HttpError
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from icalendar import Event, Calendar
from datetime import datetime
from email import encoders
import json

SCOPES = ["https://www.googleapis.com/auth/gmail.send", "https://www.googleapis.com/auth/calendar.events"]

def authenticate(service_name):
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
    match service_name:
        case "gmail":
            return build("gmail", "v1", credentials=creds)
        case "calendar":
            return build("calendar", "v3", credentials=creds)
        
def send_email(raw_message):
    service = authenticate("gmail")
    print("Email Sent")
    return service.users().messages().send(userId="me", body={"raw": raw_message}).execute()


def send_feedback(data):
    # student_email, student_name, grade, feedback
    params = json.loads(data)

    student_email = params["student_email"]
    student_name = params["student_name"]
    grade = params["grade"]
    feedback = params["feedback"]

    """Sends a well-formatted email with grading results and feedback."""
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
        send_message = send_email(raw_message)
        return send_message
    except Exception as e:
        print(f"❌ Failed to send email: {e}")
        return None
    
def create_ics(event_title, event_description, start_time, end_time, meet_link):
    """Create and return an .ics file for the event."""
    cal = Calendar()
    event = Event()

    event.add("summary", event_title)
    event.add("description", event_description)
    event.add("dtstart", datetime.fromisoformat(start_time))
    event.add("dtend", datetime.fromisoformat(end_time))
    event.add("dtstamp", datetime.now())
    event.add("location", "Google Meet")
    event.add("url", meet_link)

    cal.add_component(event)

    ics_file_name = "event.ics"
    with open(ics_file_name, "wb") as ics_file:
        ics_file.write(cal.to_ical())

    return ics_file_name
    
def send_meeting_invite(data):
    # email, name, event_title, event_description, start_time, end_time
    params = json.loads(data)

    email = params["email"]
    name = params["name"]
    event_title = params["event_title"]
    event_description = params["event_description"]
    start_time = params["start_time"]
    end_time = params["end_time"]
    """Creates a Google Calendar event with Google Meet and sends an invite via Gmail."""
    try:
        calendar_service = authenticate("calendar")

        # Define the event details
        event = {
            "summary": event_title,
            "location": f"Google Meet",
            "description": event_description,
            "start": {
                "dateTime": start_time,
                "timeZone": "America/Phoenix",
            },
            "end": {
                "dateTime": end_time,
                "timeZone": "America/Phoenix",
            },
            "attendees": [
                {"email": email},
            ],
            "conferenceData": {
                "createRequest": {
                    "requestId": "random-unique-id",
                    "conferenceSolutionKey": {"type": "hangoutsMeet"},
                },
            },
        }

        # Create the event
        event_result = calendar_service.events().insert(
            calendarId="primary",
            body=event,
            conferenceDataVersion=1
        ).execute()

        # Google Meet link
        meet_link = event_result["conferenceData"]["entryPoints"][0]["uri"]

        ics_file_name = create_ics(event_title, event_description, start_time, end_time, meet_link)

        # Send an email with the event details and Google Meet link
        subject = f"📅 Invitation to: {event_title}"
        email_body = (
            f"<html>"
            f"<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>"
            f"<p style='font-size: 16px;'>Hi <strong>{name}</strong>,</p>"
            f"<p style='font-size: 16px;'>You are invited to the following event:</p>"
            f"<h2 style='color: #2E86C1;'>{event_title}</h2>"
            f"<p style='font-size: 16px;'>{event_description}</p>"
            f"<p style='font-size: 16px;'>Event time: {start_time} to {end_time}</p>"
            f"<p style='font-size: 16px;'>Join the meeting via Google Meet: <a href='{meet_link}'>{meet_link}</a></p>"
            f"</body>"
            f"</html>"
        )

        # Create Email Message
        message = MIMEMultipart()
        message.attach(MIMEText(email_body, "html"))
        message["to"] = email
        message["subject"] = subject
        with open(ics_file_name, "rb") as ics_file:
            part = MIMEBase("application", "octet-stream")
            part.set_payload(ics_file.read())
            encoders.encode_base64(part)
            part.add_header(
                "Content-Disposition",
                f"attachment; filename={ics_file_name}",
            )
            message.attach(part)
        raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()

        try:
            send_email(raw_message)
            print(f"✅ Calendar invite and email sent successfully to {email}")
            return event_result
        except Exception as e:
            print(f"❌ Failed to send email: {e}")
            return None
    except HttpError as error:
        print(f"❌ An error occurred: {error}")
        return None
    
def create_study_event(data):
    
    # topic, start_time, end_time
    params = json.loads(data)

    topic = params["topic"]
    start_time = params["start_time"]
    end_time = params["end_time"]

    # print(f"[ALPHABETA] {topic} {start_time} {end_time}")
    # print(f"[BETAGAMMA] {type(topic)} {type(start_time)} {type(end_time)}")

    # params = json.loads(data)

    # topic = params["event_title"]
    # start_time = params["start_time"]
    # end_time = params["end_time"]

    """Creates a study event in the Google Calendar."""
    service = authenticate("calendar")

    # Event details
    event = {
        "summary": f"Study: {topic}",
        "description": f"Study session for {topic}.",
        "start": {
            "dateTime": start_time,
            "timeZone": "America/Phoenix",  # Change to the timezone you need
        },
        "end": {
            "dateTime": end_time,
            "timeZone": "America/Phoenix",  # Change to the timezone you need
        },
        "reminders": {
            "useDefault": True,
        },
    }

    # Insert the event into the calendar
    try:
        event_result = service.events().insert(
            calendarId="primary", body=event
        ).execute()
        print(f"Event created: {event_result.get('htmlLink')}")
        return event_result
    except Exception as e:
        print(f"❌ Error creating event: {e}")
        return None

if __name__ == "__main__":
    # send_email("sparash8@asu.edu", "Suprad Suresh Parashar", 10, "Great job! Keep up the good work!")
    # send_calendar_invite("sparash8@asu.edu", "Suprad Suresh Parashar", "Test Event", "This is a test event", "2025-03-13T09:00:00", "2025-03-13T10:00:00")
    # create_study_event("Math", "2025-03-13T09:00:00", "2025-03-13T10:00:00")
    pass

