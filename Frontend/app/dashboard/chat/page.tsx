"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, Upload } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import LoadingSpinner from "@/components/loading-spinner"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

export default function ChatPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm EduBot, your AI learning assistant. How can I help you today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
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
          content: `I've received your file: ${e.target.files[0].name}. How would you like me to help you with this document?`,
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

    // Simulate AI response
    setTimeout(() => {
      const aiResponses: Record<string, string> = {
        hello: "Hi there! How can I assist with your studies today?",
        help: "I can help with homework questions, explain concepts, provide study tips, or assist with research. What do you need help with?",
        assignment:
          "I'd be happy to help with your assignment. Could you provide more details about what you're working on?",
        exam: "Preparing for an exam? I can help you review key concepts, create practice questions, or develop study strategies.",
        default:
          "Based on the search results and common recommendations, here are some of the best places to study on campus:\n" +
          "\n" +
          "1. Campus Library\n" +
          "   - Offers a quiet environment with various study spaces\n" +
          "   - Access to resources and reference materials\n" +
          "   - Often has private study rooms or carrels that can be reserved\n" +
          "   - Provides a focused atmosphere conducive to studying\n" +
          "\n" +
          "2. Empty Classrooms\n" +
          "   - Quiet and distraction-free\n" +
          "   - Plenty of desk space\n" +
          "   - Good for individual or group study sessions\n" +
          "\n" +
          "3. Student Lounges or Common Spaces\n" +
          "   - Comfortable seating options\n" +
          "   - Often less crowded than libraries\n" +
          "   - Can provide a change of scenery from dorm rooms\n" +
          "\n" +
          "4. Coffee Shops on Campus\n" +
          "   - Offer a relaxed atmosphere with background noise\n" +
          "   - Access to caffeine and snacks\n" +
          "   - Can be good for light studying or reading\n" +
          "\n" +
          "5. Outdoor Spaces (weather permitting)\n" +
          "   - Fresh air can help with focus and productivity\n" +
          "   - Campus quads or green spaces can be peaceful study spots\n" +
          "\n" +
          "6. Dorm Study Rooms or Common Areas\n" +
          "   - Convenient for residents\n" +
          "   - Often quieter than individual dorm rooms\n" +
          "\n" +
          "7. Academic Building Lobbies or Atriums\n" +
          "   - Can provide a different environment from typical study spots\n" +
          "   - Often have tables and seating areas\n" +
          "\n" +
          "The best study spot will vary depending on individual preferences and study needs. It's recommended to try different locations to find what works best for you in terms of noise level, comfort, and productivity.",
      }

      // Find a matching response or use default
      let responseText = aiResponses.default
      for (const [keyword, response] of Object.entries(aiResponses)) {
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
    }, 1500)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return null
  }

  return (
    <DashboardLayout user={user} onLogout={() => router.push("/login")}>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <div className="border-b p-4">
          <h2 className="text-xl font-bold">EduBot Assistant</h2>
          <p className="text-sm text-gray-500">Ask questions about your courses, assignments, or get study help</p>
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
            <Input type="file" id="file-upload" className="hidden" onChange={handleFileSelect} />
            <Button
              type="button"
              size="icon"
              variant="outline"
              disabled={isTyping}
              onClick={() => document.getElementById("file-upload")?.click()}
              title="Upload file"
            >
              <Upload className="h-5 w-5" />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
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

