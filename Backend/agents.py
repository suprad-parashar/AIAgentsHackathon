from langchain.agents import initialize_agent, AgentType
from langchain.tools import Tool
from langchain_core.tools import tool
from langchain_groq import ChatGroq
from dotenv import load_dotenv
import os
import json

from resources import get_external_resources, get_asu_resources
from parse import parse_data
from summary import parse_summary
from feedback import index_course_material, extract_text_from_source, retrieve_relevant_material, grade_answers, provide_feedback

import pickle
import base64
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from composio import Composio

from langchain_google_genai.chat_models import ChatGoogleGenerativeAI

from google_tools import send_feedback, send_meeting_invite, create_study_event

load_dotenv()

LLM = ChatGoogleGenerativeAI(model=os.getenv("GEMINI_MODEL"), api_key=os.getenv("GEMINI_API_KEY"))

def create_tool(function, name, description):
    return Tool(
        name=name,
        description=description,
        func=function
    )

def get_resource_agent():
    # llm = ChatGroq(temperature=0, groq_api_key=os.getenv("GROQ_API_KEY"), model_name=os.getenv("GROQ_MODEL"))
    llm = LLM
    tools = [
        create_tool(get_external_resources, "Get External Resources", "Get external resources based on a Learning Topic"),
        create_tool(get_asu_resources, "Get ASU Resources", "Get ASU resources based on a prompt such as Mental Health, Food, etc.")
    ]
    agent = initialize_agent(
        tools=tools,
        llm=llm,
        agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
        verbose=True
    )
    return agent

def get_parse_agent():
    # llm = ChatGroq(temperature=0, groq_api_key=os.getenv("GROQ_API_KEY"), model_name=os.getenv("GROQ_MODEL"))
    llm = LLM
    tools = [
        create_tool(parse_data, "Parse Data", "Parse data from a URL or file"),
        create_tool(parse_summary, "Parse Syllabus", "Parse the syllabus given as text by the Professor and returns a JSON containing the relevant information")
    ]
    agent = initialize_agent(
        tools=tools,
        llm=llm,
        agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
        verbose=True
    )
    return agent

def get_db_agent():
    # llm = ChatGroq(temperature=0, groq_api_key=os.getenv("GROQ_API_KEY"), model_name=os.getenv("GROQ_MODEL"))
    llm = LLM
    tools = [
        create_tool(index_course_material, "Index Course Material", "Index any text extracted from course material into Elasticsearch"),
        create_tool(extract_text_from_source, "Extract Text from Source", "Extract text from a file path or link"),
        create_tool(retrieve_relevant_material, "Retrieve Relevant Material", "Retrieve relevant course materials from Elasticsearch using similarity search"),
        create_tool(grade_answers, "Grade Answers", "Grade answers based on rubric and retrieved materials"),
        create_tool(provide_feedback, "Provide Feedback", "Provide feedback using retrieved materials")
    ]
    agent = initialize_agent(
        tools=tools,
        llm=llm,
        agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
        verbose=True
    )
    return agent

def get_google_agent():
    # llm = ChatGroq(temperature=0, groq_api_key=os.getenv("GROQ_API_KEY"), model_name=os.getenv("GROQ_MODEL"))
    llm = LLM
    tools = [
        create_tool(send_feedback, "Send Email", "Send a well-formatted email with grading results and feedback"),
        create_tool(send_meeting_invite, "Send Meeting Invite", "Send a meeting invite to the student or professor"),
        create_tool(create_study_event, "Create Study Event", "Create a study event in Google Calendar. The times are in the ISO 8601 format. The function takes three arguments - event_title, start_time, end_time.")
    ]
    agent = initialize_agent(
        tools=tools,
        llm=llm,
        agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
        verbose=True
    )
    return agent

if __name__ == "__main__":
    google_agent = get_google_agent()
    resource_agent = get_resource_agent()
    parse_agent = get_parse_agent()
    db_agent = get_db_agent()
    google_agent_format = [
        {
            "function": "create_study_event",
            "parameters": {
                "topic": "str",
                "start_time": "datetime",
                "end_time": "datetime"
            }
        },
        {
            "function": "send_feedback",
            "parameters": {
                "student_email": "str",
                "student_name": "str",
                "grade": "float",
                "formatted_feedback": "str"
            }
        },
        {
            "function": "send_meeting_invite",
            "parameters": {
                "email": "str",
                "name": "str",
                "event_title": "str",
                "event_description": "str",
                "start_time": "datetime",
                "end_time": "datetime"
            }
        }
    ]
    resource_agent_format = [
        {
            "function": "get_external_resources",
            "parameters": {
                "topic": "str"
            }
        },
        {
            "function": "get_asu_resources",
            "parameters": {
                "prompt": "str"
            }
        }
    ]
    parse_agent_format = [
        {
            "function": "parse_data",
            "parameters": {
                "input_path": "str"
            }
        },
        {
            "function": "parse_summary",
            "parameters": {
                "summary": "str"
            }
        }
    ]
    db_agent_format = [
        {
            "function": "index_course_material",
            "parameters": {
                "data": "str",
            }
        },
        {
            "function": "extract_text_from_source",
            "parameters": {
                "file_or_link": "str"
            }
        },
        {
            "function": "retrieve_relevant_material",
            "parameters": {
                "question_text": "str"
            }
        },
        {
            "function": "grade_answers",
            "parameters": {
                "question_text": "str",
                "rubric": "str",
                "student_answers": "str",
                "course_materials": "str"
            }
        },
        {
            "function": "provide_feedback",
            "parameters": {
                "question_text": "str",
                "student_answers": "str",
                "course_materials": "str"
            }
        }
    ]
    # google_agent_format_str = json.dumps(google_agent_format)
    # google_agent.run(f"{google_agent_format_str}. Remind me to study Machine Learning on the upcoming Friday at 3pm for 2 hours")
    # resource_agent_format_str = json.dumps(resource_agent_format)
    # resource_agent.run(f"{resource_agent_format_str}. Suggest some resources to learn Machine Learning")
    # parse_agent_format_str = json.dumps(parse_agent_format)
    # parse_agent.run(f"{parse_agent_format_str}. What does this file talk about? https://github.com/suprad-parashar/AIAgentsHackathon/blob/main/Backend/agents.py")
    db_agent_format_str = json.dumps(db_agent_format)
    db_agent.run(f"{db_agent_format_str}. Can you give me an overview of the material in https://learning-asu.simplesyllabus.com/api2/doc-pdf/po83vht0c/Fall-C-2024-CSE-110-6765-.pdf")