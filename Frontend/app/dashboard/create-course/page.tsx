"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bot, Send, Upload } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import LoadingSpinner from "@/components/loading-spinner"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

export default function CreateCoursePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Welcome to the course creation assistant! I'll help you set up a new course. What would you like to name your course?",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [courseData, setCourseData] = useState({
    title: "",
    description: "",
    step: 1,
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }

    // Only professors can access this page
    if (!loading && user && user.role !== "professor") {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
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
          content: `Thanks for uploading ${e.target.files[0].name}. I'll use this as course material. Would you like to add more details about your course?`,
          sender: "ai",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, aiMessage])
        setIsTyping(false)
      }, 1500)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim()) return

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

    // Process course creation steps
    let responseText = ""

    if (courseData.step === 1) {
      // Save course title
      setCourseData((prev) => ({ ...prev, title: input, step: 2 }))
      responseText = `Great! Your course will be titled "${input}". Now, please provide a brief description of the course.`
    } else if (courseData.step === 2) {
      // Save course description
      setCourseData((prev) => ({ ...prev, description: input, step: 3 }))
      responseText = `Thanks for the description. Would you like to upload any initial course materials or syllabus? You can also type any additional details about your course structure.`
    } else if (courseData.step === 3) {
      // Course creation completion
      setCourseData((prev) => ({ ...prev, step: 4 }))
      responseText = `Perfect! I've created your new course "${courseData.title}". You can now add modules, assignments, and invite students. Would you like to view your new course now?`
    } else {
      // Finalization
      if (input.toLowerCase().includes("yes")) {
        responseText = `Great! I'll redirect you to your new course page in a moment.`

        // Simulate redirect after a short delay
        setTimeout(() => {
          router.push("/dashboard?tab=courses")
        }, 2000)
      } else {
        responseText = `No problem. You can access your new course anytime from your dashboard. Is there anything else you'd like to know about course creation?`
      }
    }

    // Simulate AI response delay
    setTimeout(() => {
      const aiMessage: Message = {
        id: Date.now().toString(),
        content: responseText,
        sender: "ai",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
      setIsTyping(false)
    }, 1500)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user || user.role !== "professor") {
    return null
  }

  return (
    <DashboardLayout user={user} onLogout={() => router.push("/login")}>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <div className="border-b p-4">
          <h2 className="text-xl font-bold">Course Creation Assistant</h2>
          <p className="text-sm text-gray-500">I'll help you set up a new course step by step</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
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

                <Card className={`${message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  <CardContent className="p-3">
                    <p>{message.content}</p>
                    <div
                      className={`text-xs mt-1 ${message.sender === "user" ? "text-primary-foreground/70" : "text-gray-500"}`}
                    >
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </CardContent>
                </Card>

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
                <Card className="bg-muted">
                  <CardContent className="p-3">
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
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <Input type="file" id="course-creation-file" className="hidden" onChange={handleFileSelect} />
            <Button
              type="button"
              size="icon"
              variant="outline"
              disabled={isTyping}
              onClick={() => document.getElementById("course-creation-file")?.click()}
              title="Upload syllabus or course materials"
            >
              <Upload className="h-5 w-5" />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your response..."
              className="flex-1"
              disabled={isTyping}
            />
            <Button type="submit" size="icon" disabled={!input.trim() || isTyping}>
              <Send className="h-5 w-5" />
            </Button>
          </form>
          {selectedFile && <div className="mt-2 text-sm text-gray-500">Selected file: {selectedFile.name}</div>}
        </div>
      </div>
    </DashboardLayout>
  )
}

