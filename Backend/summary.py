from google import genai
from dotenv import load_dotenv
import os
from pydantic import BaseModel

load_dotenv()

class Timings(BaseModel):
    day: str
    start_time: int
    end_time: int
class GradingPolicy(BaseModel):
    grade: str
    lower_limit: int
    upper_limit: int
class Syllabus(BaseModel):
    prof_office_hours: list[Timings]
    prof_email: str
    prof_name: str
    course_name: str
    course_code: str
    course_description: str
    course_prerequisites: str
    ta_office_hours: list[Timings]
    ta_email: str
    ta_name: str
    grader_office_hours: list[Timings]
    grader_email: str
    grader_name: str
    module_names: list[str]
    class_timings: list[Timings]
    class_location: str
    grading_policy: list[GradingPolicy]
    missing_info: list[str]


# Things to get from summary

# TA, Graders and Professors Information - Email, Office Hours, Location
# Course Information - Course Name, Course Code, Course Description, Course Prerequisites
# Course Structure - Module Names
# Course Schedule - Class Timings, Location
# Grading Policy

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def parse_summary(summary):
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents="Based on the following information, extract the necessary details. If certain information is missing, leave the field empty and add the field name to the missing_info list.\n\n" + summary,
        config={
            'response_mime_type': 'application/json',
            'response_schema': Syllabus,
        }
    )
    with open("response.json", "w") as f:
        f.write(response.text)

def main():
    parse_summary("""
CSE 546: Cloud Computing (2025 Spring C)
Jump to Today
Disclaimer: The instructor may update the syllabus based on the class's progress, and all updates will be communicated to the class.

Instructor: Dr. Yuli Deng (ydeng19@asu.edu)

TA: Neha Vadnere(nvadnere@asu.edu)

Office Hour:

Yuli's Office Hour: 2:30PM-3:30PM every Thursday before the class. Both Zoom (https://asu.zoom.us/j/83925646580Links to an external site.) and in-person at BYENG MI-04

Neha's Office Hour: 2PM-3PM every Wednesday on Zoom (Link: https://asu.zoom.us/j/82242613308Links to an external site.)

 

Tentative Timeline
Jan 13 - 17: Introduction to Cloud Computing
Jan 20 - 24: History of Cloud Computing (Project 0 starts)
Jan 27 - 31: Introduction to Virtualization (Project 0 due on Feb 2)
Feb 3 - 7: IaaS (Project 1 starts)
Feb 10 - 14: IaaS and Invited Talk
Feb 17 - 21: Virtual Machines (Project 1 Part I due on Feb 23)
Feb 24 - 28:  Project 1 Review and Second Invited Talk
Mar 3 - 7: Virtual Machines and Midterm (Midterm Exam on Mar 6 in class)
Mar 10 - 14: Spring Break
Mar 17 - 21: Virtual Machines (Project 1 Part II due on Mar 23)
Mar 24 - 28: PaaS (Project 2 starts)
Mar 31 - Apr 4: PaaS 
Apr 7 - 11: Virtual Storage (Project 2 Part I due on Apr 13)
Apr 14 - 18: Virtual Storage, Virtual Networking
Apr 21 - 25: Virtual Networking
Apr 28 - May 2: Emerging Technologies (Project 2 Part II due on May 4)
May 5 - 9: Final Exam
 

FAQ:

Q: Can I request an exception to any of the class policies?
A: No. Because we have a large class, to avoid any confusion and make sure everyone is treated fairly, we will strictly follow all policies specified in the syllabus below. No exception can be made.

Q: How do I get help?
A: Come to the office hour. Ask on Ed Discussion. But do not email the instructor or TA directly. Also do not repeat a question already asked on Ed Discussion. Those emails/questions will be skipped by the instructor and TA.

Q: Can we know when there will be a pop quiz?
A: No. A pop quiz is a short test given to students without prior warning.

Q: What is the format of the exams and quizzes?
A: Exams and quizzes will be closed everything; no devices, notes, or cheat sheets will be allowed. There will be a combination of multi-answer questions and essay questions. Both midterm and final exams will be held in person.

Q: How are the multi-answer questions graded?
A: You get points for the correct choices and lose points for the wrong choices. The number of points depends on the number of correct answers for the question. For example, if the question has two correct answers,  then each correct answer gets 2 points and each wrong answer costs 2 points. Your final score for a question will be between zero and full marks.

Q: How are the essay questions graded?
A: You get points for each key aspect that you cover in your answer. Answer concisely and legibly to help us find points for you.

Q: Can I review the exams/quizzes I did?
A: Yes, every exam and quiz will be reviewed in class. You can also come to the office hour to review it with Dr. Deng. However, to prevent the exams being circulated, we do not return the exams to students and you are not allowed to take any picture or video of the exams either.

Q: Can I request a make-up exam/quiz?
A: No. Check the exam protocol below. If you miss a pop quiz, try to contribute to the discussions on Ed Discussion and get bonus points to make up for the points you lose for the missed quiz.

Q: Can I use any language of my choice to develop the projects?
A: No. To facilitate grading, you are required to use Python for all programs that you develop.

Q: Can I submit or resubmit a project after deadline?
A: No. Check the project protocol below.

Q: How are the projects graded?
A: First, we will run test cases against the cloud app. You must keep your app up and running till the grading is done. You will lose all points if the credentials you provided do not work. Then, we will check your code submission on Canvas for completeness and against plagiarism. You will lose all points if the autograder cannot find or unzip your submission.

Q: Can I collaborate with my friends on exams or projects?
A: No. You must complete all assignments independently. Anti-plagiarism tools will be used, and violations will lead to sanctions ranging from a zero for the assignment and an XE grade for the entire course.

Q: Can I use AI to help complete exams or projects?
A: No. You must complete all assignments independently. AI-code detection tools will be used, and violations will lead to sanctions ranging from a zero for the assignment and an XE grade for the entire course.

Q: Can I request a bonus assignment to get the grade I want?
A: No. Bonus assignments will be decided based on the entire class's performance, not your individual performance. If it is provided, it will be also be provided to the entire class.

Q: When is the final exam?
A: Final exams are scheduled by the university. Dr. Deng will announce it once it is available.

Q: I passed only one of the two projects, can I still list that project on my portfolio?
A: No. Check the portfolio requirements below.

Q: Do I need to do anything to include the projects on my portfolio?
A: No. Check the portfolio requirements below.

Q: Can I do some research with you outside the class?
A: Absolutely! Please send me your resume and transcripts. Financial support will be provided to only the students who are making good progress, but you are welcome to volunteer and get some research experience first.

 

Welcome to CSE 546: Cloud Computing
This course teaches both the fundamental concepts and principles of cloud computing and the practical skills for developing cloud applications on widely used Infrastructure-as-a-Service and Platform-as-a-Service resources. The course takes a novel bottom-up approach to teach cloud computing, covering both the enabling technologies (virtualization) of cloud computing and the practical cloud programming techniques (IaaS and PaaS). 

Specific topics covered include:

Introduction
Background and history of cloud computing
Cloud computing models
Virtualization
Background and history of virtualization
Virtual machines
Virtual networks
Virtual storage
Infrastructure as a Service (IaaS)
IaaS system architecture
IaaS programming
Autoscaling
Platform as a Service (PaaS)
PaaS system architecture
Function as a Service (FaaS)
PaaS programming
Emerging Technologies
Cloud and AI
Cloud and edge
 

Computer Requirements
Web browsers (Chrome , Mozilla Firefox , or Safari)
Adobe Acrobat Reader (free)
VirtualBox  (free) or UTM (free)
A computer that can run a VirtualBox or UTM virtual machine
 

Recommended Prior Knowledge
Good knowledge of data structures, computer organization, and computer networks
Proficiency in programming in at least one of the following programming languages: Java, Python, C++, .Net
 

Learning Outcomes
At the conclusion of this course, learners will be able to:

Apply the fundamental concepts and principles to analyze cloud systems
Utilize the basic approaches and techniques to develop cloud applications
 

Textbook
Dr. Z's book "Cloud Computing: A Bottom-up Approach". 

(Note: As the textbook is still a work in progress, I will keep uploading new chapters on Canvas. At the same time, your suggestions and comments are welcome and will be rewarded by bonus points to your final grade.)

 

Grading
Projects: Project 1 (22.5%), Project 2 (22.5%)
Exams: Midterm (22.5%), Final (22.5%) 
Class participation: (10%)

Grade conversion:

Grading Schema
Grade	Percentage
A+	>= 95%
A	>= 90% and < 95%
A-	>= 85% and < 90%
B+	>= 80% and < 85%
B	>= 75% and < 80%
B-	>= 70% and < 75%
C+	>= 65 and < 70%
C	>= 60% and < 65%
D	>= 50% and < 60%
E	< 50%
Note: Strictly followed; no rounding up; no I grade

Grade Distribution

 

Assignments
Projects:

All the projects should be done by students individually and independently.
Your submission will be checked carefully for plagiarism and use of AI-generated content.
In your code submission, include only the source code that you have written; you will lose points for submitting other people's code or binaries.
Use the provided autograder to test your code thoroughly; your code will be graded using test cases and a failed test case will cost you all the points assigned to it. If the credentials you provided do not work, you will lose all points.
After you submit, download it and use the autograder to test it. If the autograder cannot find or unzip your submission, you will lose all points.
Once the deadline is passed, you will not have a second chance to fix any problem or improve you code.
Late submission will not be graded; submit early and as many times as you need.
To include the projects in your MCS or 4+1 portfolio, you need to receive a passing grade for the class and a passing grade for ALL the projects.
If you meet the above requirements, your name will be automatically passed on to the advising office and you do not need to do anything else.
 

Exams:

Both exams will be in person, closed book, and closed notes (no cheat sheet allowed).
Both exams will include a combination of multi-choice questions and essay questions.
No make-up exam unless you missed it due to a verifiable emergency.
 

Class Participation: We will conduct up to 10 pop quizzes in class to help students review lecture materials and prepare for the exams. 

 

Homework: Dr. Deng will assign take-home problems to help students understand lecture materials and prepare for the exams. Homework will not be graded, but you are welcome to bring your solutions to Dr. Deng for discussions. 

 

Tips for Success
This will be a demanding course. Take this class at another time if you are not ready or cannot invest the necessary time.

To prepare for the exams, 1) attend the lectures, 2) take notes, 3) read the textbook, and 4) do the homework.
To deliver successful projects, 1) start early, 2) work consistently, 3) test your code thoroughly, and 4) be a self-driven learner.
Talk to Dr Deng and the TAs, early and often.
Be professional and be honest.
 

Absence/Late Submission Policies 
No late submission or make-up exam unless you missed it due to a verifiable emergency. Notify Dr. Deng BEFORE an assignment is due if an urgent situation arises and you are unable to submit the assignment on time, and you must present proof that we can use to verify the emergency.

Excused absences for classes will be given without penalty to the grade in the case of (1) a university-sanctioned event [ACD 304-02]; (2) religious holidays [ACD 304-04]; a list of religious holidays can be found here https://eoss.asu.edu/cora/holidays ]; (3) work performed in the line-of-duty according [SSM 201-18]. Students who request an excused absence must follow the policy/procedure guidelines. Excused absences do not relieve students of responsibility for any part of the course work required during the period of absence. 

 

Communication
We will use Ed Discussion for all course-related discussions. Do not email the instructor or TA directly unless you have a private matter to discuss. Do not message us on Canvas. 
All questions will be responded in 12 hours and typically much sooner than that. Check the syllabus and the previous posts before you post your question. Questions that are already addressed may be skipped.
You are also encouraged to answer questions from other students. You will be rewarded bonus points for your participation.
Be respectful to everyone in your communication. Do not share any source code in any way. Violations may cause your ability to post to be temporarily suspended and a zero grade for your assignment.
 

Expected Classroom Behavior
Do not come late or leave early (or you will get special quizzes from Dr. Deng).
No devices (computers, tablets, phones) are allowed unless you use them to make notes.
Lectures will not be recorded.
Students in this class are expected to acknowledge and embrace the FSE student professionalism expectation located at: https://engineering.asu.edu/professionalism/ 
 

Generative AI
Generative AI is a technology that can often be useful in helping students learn the theories and concepts in this course. However, the use of generative AI tools is not allowed to complete any portion of a course assignment or exam and will be considered academic dishonesty and a violation of the ASU Academic Integrity Policy.  Students confirmed to be engaging in non-allowable use of generative AI will be sanctioned according to the academic integrity policy and FSE sanctioning guidelines. 

 

Academic Integrity
Academic integrity will be strictly enforced on all projects and exams, and violations will lead to sanctions ranging from getting a zero for the assignment to an XE grade for the course.

All engineering students are expected to adhere to the ASU Student Honor Code and the ASU academic integrity policy, which can be found at https://provost.asu.edu/academic-integrity/policy). 

All student academic integrity violations are reported to the Fulton Schools of Engineering Academic Integrity Office (AIO). Withdrawing from this course will not absolve you of responsibility for an academic integrity violation and any sanctions that are applied. The AIO maintains a record of all violations and has access to academic integrity violations committed in all other ASU colleges/schools. 

 

Copyright Responsibilities
You must refrain from sharing any material of this course, including uploading the project documents and code to a public GitHub repo, unless you receive explicit permission from Dr. Deng and comply with all applicable copyright laws.

The contents of this course, including lectures, projects, and other instructional materials, are copyrighted materials. Students may not share outside the class, including uploading, selling or distributing course content or notes taken during the conduct of the course.  Any recording of class sessions by students is prohibited, except as part of an accommodation approved by the Disability Resource Center. (see ACD 304–06, “Commercial Note Taking Services” and ABOR Policy 5-308 F.14Links to an external site. for more information).

 

Policy against Threatening Behavior
Students, faculty, staff, and other individuals do not have an unqualified right of access to university grounds, property, or services (see SSM 104-02). Interfering with the peaceful conduct of university-related business or activities or remaining on campus grounds after a request to leave may be considered a crime. All incidents and allegations of violent or threatening conduct by an ASU student (whether on- or off-campus) must be reported to the ASU Police Department (ASU PD) and the Office of the Dean of Students. 

 

Disability Accommodations
Suitable accommodations are made for students having disabilities. Students needing accommodation must register with the ASU Student Accessibility and Inclusive Learning Services office and provide documentation of that registration to the instructor. Students should communicate the need for an accommodation in enough time for it to be properly arranged. See ACD 304-08 Classroom and Testing Accommodations for Students with Disabilities. 

 

Harassment and Sexual Discrimination
Arizona State University is committed to providing an environment free of discrimination, harassment, or retaliation for the entire university community, including all students, faculty members, staff employees, and guests. ASU expressly prohibits discrimination, harassment, and retaliation by employees, students, contractors, or agents of the university based on any protected status: race, color, religion, sex, national origin, age, disability, veteran status, sexual orientation, gender identity, and genetic information.

Title IX is a federal law that provides that no person be excluded on the basis of sex from participation in, be denied benefits of, or be subjected to discrimination under any education program or activity. Both Title IX and university policy make clear that sexual violence and harassment based on sex is prohibited. An individual who believes they have been subjected to sexual violence or harassed on the basis of sex can seek support, including counseling and academic support, from the university. If you or someone you know has been harassed on the basis of sex or sexually assaulted, you can find information and resources at https://sexualviolenceprevention.asu.edu/faqs.  
 
As a mandated reporter, I am obligated to report any information I become aware of regarding alleged acts of sexual discrimination, including sexual violence and dating violence. ASU Counseling Services, https://eoss.asu.edu/counseling is available if you wish to discuss any concerns confidentially and privately. ASU online students may access 360 Life Services, https://goto.asuonline.asu.edu/success/online-resources.html. 

 

Photo Requirement
Arizona State University requires each enrolled student and university employee to have on file with ASU a current photo that meets ASU's requirements (your "Photo"). ASU uses your Photo to identify you, as necessary, to provide you educational and related services as an enrolled student at ASU. If you do not have an acceptable Photo on file with ASU, or if you do not consent to the use of your photo, access to ASU resources, including access to course material or grades (online or in person) may be negatively affected, withheld or denied.

 

Course Summary:
Date	Details	Due
Tue Jan 14, 2025	Quiz Quiz 1	due by 11:59pm
Sun Feb 2, 2025	Assignment Project 0	due by 11:59pm
Mon Feb 3, 2025	Assignment Homework 1	due by 11:59pm
Sun Feb 23, 2025	Assignment Project 1 Part I	due by 11:59pm
Sun Mar 2, 2025	Quiz Quiz 3	due by 11:59pm
Tue Mar 4, 2025	Quiz Quiz 4	due by 5:22pm
Sun Mar 23, 2025	Assignment Project 1 Part II	due by 11:59pm
Assignment Homework 2 (ungraded)	 
Quiz Quiz 2
""")