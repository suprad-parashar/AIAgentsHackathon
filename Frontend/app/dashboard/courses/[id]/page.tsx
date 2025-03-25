"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bot, FileText, Send, Upload } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import LoadingSpinner from "@/components/loading-spinner"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

interface CourseModule {
  id: string
  title: string
  description: string
  materials: {
    id: string
    title: string
    type: "pdf" | "video" | "quiz"
    url?: string
  }[]
}

interface CourseParticipant {
  id: string
  name: string
  role: "student" | "professor" | "ta"
  avatar?: string
}

interface CourseData {
  id: string
  title: string
  description: string
  instructor: string
  modules: CourseModule[]
  participants: CourseParticipant[]
}

// Mock course data
const mockCourses: Record<string, CourseData> = {
  "5": {
    id: "5",
    title: "Introduction to Computer Science",
    description:
      "This course provides a comprehensive introduction to computer science, covering fundamental concepts, programming basics, and problem-solving techniques.",
    instructor: "Dr. Smith",
    modules: [
      {
        id: "m1",
        title: "Module 1: Introduction to Programming",
        description: "Learn the basics of programming concepts and syntax.",
        materials: [
          { id: "m1-1", title: "Lecture 1: Programming Fundamentals", type: "pdf", url: "https://learning-asu.simplesyllabus.com/api2/doc-pdf/po83vht0c/Fall-C-2024-CSE-110-6765-.pdf" },
          { id: "m1-2", title: "Lecture 2: Variables and Data Types", type: "pdf", url: "https://web.stanford.edu/class/cs110/lectures/cs110-win2122-lecture-1.pdf" },
          { id: "m1-3", title: "Programming Exercise 1", type: "quiz", url: "https://web.stanford.edu/class/cs110/lectures/cs110-win2122-lecture-1.pdf" },
        ],
      },
      {
        id: "m2",
        title: "Module 2: Control Structures",
        description: "Understand how to control program flow with conditionals and loops.",
        materials: [
          { id: "m2-1", title: "Lecture 3: Conditional Statements", type: "pdf", url: "https://web.stanford.edu/class/cs110/lectures/cs110-win2122-lecture-1.pdf" },
          { id: "m2-2", title: "Lecture 4: Loops and Iterations", type: "video", url: "https://web.stanford.edu/class/cs110/lectures/cs110-win2122-lecture-1.pdf" },
          { id: "m2-3", title: "Programming Exercise 2", type: "quiz", url: "https://web.stanford.edu/class/cs110/lectures/cs110-win2122-lecture-1.pdf" },
        ],
      },
    ],
    participants: [
      { id: "p1", name: "Dr. Smith", role: "professor" },
      { id: "p2", name: "Alice Johnson", role: "ta" },
      { id: "p3", name: "John Student", role: "student" },
      { id: "p4", name: "Emma Wilson", role: "student" },
      { id: "p5", name: "Michael Brown", role: "student" },
    ],
  },
  "6": {
    id: "6",
    title: "Calculus I",
    description:
      "An introduction to differential and integral calculus, covering limits, derivatives, and basic integration techniques.",
    instructor: "Dr. Johnson",
    modules: [
      {
        id: "m1",
        title: "Module 1: Limits and Continuity",
        description: "Understanding the concept of limits and continuity of functions.",
        materials: [
          { id: "m1-1", title: "Lecture 1: Introduction to Limits", type: "pdf" },
          { id: "m1-2", title: "Lecture 2: Continuity", type: "pdf" },
          { id: "m1-3", title: "Problem Set 1", type: "quiz" },
        ],
      },
      {
        id: "m2",
        title: "Module 2: Derivatives",
        description: "Learn how to find derivatives and apply them to real-world problems.",
        materials: [
          { id: "m2-1", title: "Lecture 3: Definition of Derivative", type: "pdf" },
          { id: "m2-2", title: "Lecture 4: Rules of Differentiation", type: "video" },
          { id: "m2-3", title: "Problem Set 2", type: "quiz" },
        ],
      },
    ],
    participants: [
      { id: "p1", name: "Dr. Johnson", role: "professor" },
      { id: "p2", name: "Robert Lee", role: "ta" },
      { id: "p3", name: "John Student", role: "student" },
      { id: "p4", name: "Sarah Parker", role: "student" },
      { id: "p5", name: "David Miller", role: "student" },
    ],
  },
}

export default function CourseDetailPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const courseId = params?.id as string

  const [course, setCourse] = useState<CourseData | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }

    // Load course data
    if (courseId && mockCourses[courseId]) {
      setCourse(mockCourses[courseId])

      // Initialize course-specific chat
      setMessages([
        {
          id: "1",
          content: `Welcome to the ${mockCourses[courseId].title} chat! How can I help you with this course?`,
          sender: "ai",
          timestamp: new Date(),
        },
      ])
    } else if (!loading) {
      // Course not found
      router.push("/dashboard")
    }
  }, [courseId, user, loading, router])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || !course) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate AI response with course-specific context
    setTimeout(() => {
      // Course-specific responses based on the course ID
      const courseResponses: Record<string, Record<string, string>> = {
        "5": {
          // Computer Science
          assignment:
            "For the current programming assignment, you need to implement a simple algorithm using loops and conditionals. Would you like me to explain any specific part?",
          lecture:
            "The latest lecture covered programming fundamentals including variables, data types, and basic syntax. What specific concept would you like me to explain?",
          module:
            "This course has two modules: Introduction to Programming and Control Structures. Which one are you asking about?",
          default:
            "Programming fundamentals are the foundational concepts and principles that guide how we write and structure code. These concepts are applicable across different programming languages and form the building blocks for more advanced programming techniques. Here are some key programming fundamentals:\n" +
            "\n" +
            "Variables and Data Types:\n" +
            "\n" +
            "Variables are used to store data, and data types define the kind of data a variable can hold (e.g., integers, floating-point numbers, strings, booleans).\n" +
            "Understanding how to choose the right data type for the task is essential for writing efficient code.\n" +
            "Control Structures:\n" +
            "\n" +
            "These include conditionals (like if, else, switch) that help decide which code to execute based on certain conditions.\n" +
            "Loops (e.g., for, while) allow code to run repeatedly, useful for tasks like iterating through data or handling repetitive tasks.\n" +
            "Functions (or Methods):\n" +
            "\n" +
            "Functions are blocks of code that perform a specific task and can be reused throughout a program.\n" +
            "Functions help in organizing code, reducing redundancy, and enhancing readability. Parameters and return values are key to how functions interact with other parts of the program.\n" +
            "Arrays and Lists:\n" +
            "\n" +
            "These are data structures that store multiple values in a single variable. Arrays are fixed-size, while lists can grow dynamically.\n" +
            "Arrays and lists are essential for working with collections of data efficiently.\n" +
            "Object-Oriented Programming (OOP):\n" +
            "\n" +
            "This programming paradigm uses \"objects\" to represent real-world entities, combining data (attributes) and functions (methods) that act on that data.\n" +
            "Core OOP concepts include classes, inheritance, polymorphism, encapsulation, and abstraction, which help in designing scalable, reusable, and maintainable systems.\n" +
            "Algorithms:\n" +
            "\n" +
            "Algorithms are step-by-step instructions used to perform a task or solve a problem. Understanding how to write and optimize algorithms is key to solving complex programming challenges.\n" +
            "Common algorithms include sorting, searching, and recursive algorithms.\n" +
            "Error Handling:\n" +
            "\n" +
            "It’s important to handle errors in a way that prevents a program from crashing unexpectedly. This is done using mechanisms like try-catch blocks (exception handling) in many languages.\n" +
            "Proper error handling improves the robustness and user experience of applications.\n" +
            "Debugging and Testing:\n" +
            "\n" +
            "Debugging involves identifying and fixing errors (bugs) in your code.\n" +
            "Writing tests, like unit tests or integration tests, helps ensure that the code behaves as expected and makes it easier to spot and fix bugs early.\n" +
            "Memory Management:\n" +
            "\n" +
            "Understanding how memory is allocated and freed is important for creating efficient programs.\n" +
            "This includes concepts like stack vs heap memory and garbage collection in some languages (e.g., Python, Java) or manual memory management (e.g., C).\n" +
            "Version Control:\n" +
            "\n" +
            "Tools like Git are essential for tracking changes in code, collaborating with others, and managing different versions of a program.\n" +
            "Version control ensures that code changes are well-documented and easy to manage.\n" +
            "Mastering these fundamental concepts provides a strong foundation for tackling more complex problems and learning advanced topics in programming.",
        },
        "6": {
          // Calculus
          assignment:
            "The current calculus assignment focuses on derivative applications. Are you having trouble with a specific problem?",
          lecture:
            "The recent lecture covered the rules of differentiation, including the power rule, product rule, and chain rule. Which part would you like me to explain further?",
          yes:
            "Okay, I have sent an email to sujithramprasad@gmail.com",
          default:
            "Grade:\n" +
            "\n" +
            "Multiple Choice Accuracy: 4/10 (Three incorrect answers)\n" +
            "Short Answer Clarity: 7/10 (Mostly correct but missing some depth)\n" +
            "Conceptual Depth: 7/10 (Good understanding but lacks depth in some areas)\n" +
            "Use of Examples: 7/10 (Uses examples but could be more detailed)\n" +
            "Overall Effort and Completeness: 8/10 (Well-attempted with minor gaps)\n" +
            "Total Score: 33/50\n" +
            "Feedback:\n" +
            "\n" +
            "You have made a strong effort in answering the quiz, and your responses demonstrate a good foundational understanding of crash recovery in filesystems. However, there are a few areas where more precision and depth could improve your score.\n" +
            "\n" +
            "For the multiple-choice section, you correctly answered some key questions but missed others. For instance, the correct drawback of using a linked list to manage free space is (b) It becomes scrambled over time, reducing contiguous allocation. Similarly, the block cache's purpose is to retain frequently accessed disk blocks in memory for faster access rather than storing deleted files. Lastly, fsck’s main purpose is to repair filesystem issues rather than just boosting I/O performance. Reviewing these concepts can strengthen your understanding.\n" +
            "\n" +
            "Your short answers were clear and correctly explained the trade-offs between synchronous and delayed writes. However, you could have elaborated on how journaling filesystems mitigate data loss risks when explaining fsck’s role in resolving inconsistencies. Adding specific examples of how different filesystems handle these challenges (e.g., ext4 vs. NTFS) would enhance your response.\n" +
            "\n" +
            "In the conceptual section, your understanding of crash recovery techniques like ordered writes and fsck is solid, but expanding on alternative methods like journaling or shadow paging would improve your answers. Also, your discussion on inode corruption risks was accurate, but mentioning how metadata consistency checks can prevent such issues would have added more depth.\n" +
            "\n" +
            "Overall, this is a well-attempted quiz with good clarity and effort. Focus on refining technical accuracy and expanding explanations with concrete examples to improve further. Keep up the good work! 🚀\n\n\n" +
            "Do you want to send an email to the student?",
        }
      }

      // Find a matching response or use default
      let responseText =
        courseResponses[course.id]?.default || "I'm here to help with your questions about this course."

      for (const [keyword, response] of Object.entries(courseResponses[course.id] || {})) {
        if (userMessage.content.toLowerCase().includes(keyword)) {
          responseText = response
          break
        }
      }

      // Add AI response
      const aiMessage: Message = {
        id: Date.now().toString(),
        content: responseText,
        sender: "ai",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
      setIsTyping(false)
    }, 4500)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])

      // Add a user message about the uploaded file
      const fileMessage: Message = {
        id: Date.now().toString(),
        content: `I've uploaded a file: ${e.target.files[0].name}`,
        sender: "user",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, fileMessage])

      // Simulate AI response about the file
      setIsTyping(true)
      setTimeout(() => {
        const aiMessage: Message = {
          id: Date.now().toString(),
          content: `I've received your file: ${e.target.files[0].name}. How would you like me to help you with this document related to ${course?.title}?`,
          sender: "ai",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, aiMessage])
        setIsTyping(false)
      }, 1500)
    }
  }

  if (loading || !course) {
    return <LoadingSpinner />
  }

  return (
    <DashboardLayout user={user} onLogout={() => router.push("/login")}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{course.title}</h2>
            <p className="text-gray-500">Instructor: {course.instructor}</p>
          </div>
          <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
        </div>

        <Tabs defaultValue="content" className="space-y-4">
          <TabsList>
            <TabsTrigger value="content">Course Content</TabsTrigger>
            <TabsTrigger value="chat">Course Chat</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <div className="grid gap-4">
              {course.modules.map((module) => (
                <Card key={module.id}>
                  <CardHeader>
                    <CardTitle>{module.title}</CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {module.materials.map((material) => (
                        <a href={material.url} target='_blank'>
                        <li
                          key={material.id}
                          className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md"
                        >
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 mr-2 text-gray-500" />
                            <span>{material.title}</span>
                          </div>
                          <div>
                              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                                {material.type.toUpperCase()}
                              </span>
                          </div>
                        </li>
                        </a>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            <Card className="h-[calc(100vh-300px)] flex flex-col">
              <CardHeader>
                <CardTitle>Course Chat Assistant</CardTitle>
                <CardDescription>Ask questions specific to {course.title}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex max-w-[80%] ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                      {message.sender === "ai" && (
                        <div className="flex-shrink-0 mr-3">
                          <Avatar>
                            <AvatarFallback>
                              <Bot className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      )}

                      <div
                        className={`p-3 rounded-lg ${message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                      >
                        <p>{message.content}</p>
                        <div
                          className={`text-xs mt-1 ${message.sender === "user" ? "text-primary-foreground/70" : "text-gray-500"}`}
                        >
                          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>

                      {message.sender === "user" && (
                        <div className="flex-shrink-0 ml-3">
                          <Avatar>
                            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex flex-row max-w-[80%]">
                      <div className="flex-shrink-0 mr-3">
                        <Avatar>
                          <AvatarFallback>
                            <Bot className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="p-3 rounded-lg bg-muted">
                        <div className="flex space-x-1">
                          <div
                            className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </CardContent>
              <div className="border-t p-4 mt-auto">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <Input type="file" id="course-file-upload" className="hidden" onChange={handleFileSelect} />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    disabled={isTyping}
                    onClick={() => document.getElementById("course-file-upload")?.click()}
                    title="Upload file"
                  >
                    <Upload className="h-5 w-5" />
                  </Button>
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Ask about ${course.title}...`}
                    className="flex-1"
                    disabled={isTyping}
                  />
                  <Button type="submit" size="icon" disabled={!input.trim() || isTyping}>
                    <Send className="h-5 w-5" />
                  </Button>
                </form>
                {selectedFile && <div className="mt-2 text-sm text-gray-500">Selected file: {selectedFile.name}</div>}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="participants" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Course Participants</CardTitle>
                <CardDescription>People enrolled in this course</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Instructors & TAs</h3>
                    <div className="space-y-2">
                      {course.participants
                        .filter((p) => p.role === "professor" || p.role === "ta")
                        .map((participant) => (
                          <div key={participant.id} className="flex items-center p-2 hover:bg-gray-50 rounded-md">
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarImage
                                src={participant.avatar || `/placeholder.svg?height=40&width=40`}
                                alt={participant.name}
                              />
                              <AvatarFallback>{participant.name.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{participant.name}</p>
                              <p className="text-sm text-gray-500">
                                {participant.role === "professor" ? "Professor" : "Teaching Assistant"}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Students</h3>
                    <div className="space-y-2">
                      {course.participants
                        .filter((p) => p.role === "student")
                        .map((participant) => (
                          <div key={participant.id} className="flex items-center p-2 hover:bg-gray-50 rounded-md">
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarImage
                                src={participant.avatar || `/placeholder.svg?height=40&width=40`}
                                alt={participant.name}
                              />
                              <AvatarFallback>{participant.name.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{participant.name}</p>
                              <p className="text-sm text-gray-500">Student</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

