from google import genai
import os
# from pydantic import BaseModel
import json

# class Timings(BaseModel):
#     day: str
#     start_time: int
#     end_time: int
# class GradingPolicy(BaseModel):
#     grade: str
#     lower_limit: int
#     upper_limit: int
# class Syllabus(BaseModel):
#     prof_office_hours: list[Timings]
#     prof_email: str
#     prof_name: str
#     course_name: str
#     course_code: str
#     course_description: str
#     course_prerequisites: str
#     ta_office_hours: list[Timings]
#     ta_email: str
#     ta_name: str
#     grader_office_hours: list[Timings]
#     grader_email: str
#     grader_name: str
#     module_names: list[str]
#     class_timings: list[Timings]
#     class_location: str
#     grading_policy: list[GradingPolicy]
#     missing_info: list[str]


# Things to get from summary

# TA, Graders and Professors Information - Email, Office Hours, Location
# Course Information - Course Name, Course Code, Course Description, Course Prerequisites
# Course Structure - Module Names
# Course Schedule - Class Timings, Location
# Grading Policy

client = genai.Client(api_key=os.environ("GEMINI_API_KEY"))

def lambda_handler(event, context):
    # summary = event["summary"]
    # response = client.models.generate_content(
    #     model="gemini-2.0-flash",
    #     contents="Based on the following information, extract the necessary details. If certain information is missing, leave the field empty and add the field name to the missing_info list.\n\n" + summary,
    #     # config={
    #     #     'response_mime_type': 'application/json',
    #     #     'response_schema': Syllabus,
    #     # }
    # )
    return {
        "statusCode": 200,
        "body": "Testing... 1... 2... 3..."
    }