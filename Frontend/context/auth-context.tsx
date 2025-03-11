"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  role: "student" | "professor"
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string, role: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // In a real app, you would make an API call to your backend
    // This is a mock implementation for demonstration purposes

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock validation
    if (email === "student@example.com" && password === "password") {
      const user = {
        id: "1",
        name: "John Student",
        email: "student@example.com",
        role: "student" as const,
      }
      setUser(user)
      localStorage.setItem("user", JSON.stringify(user))
      return
    } else if (email === "professor@example.com" && password === "password") {
      const user = {
        id: "2",
        name: "Dr. Smith",
        email: "professor@example.com",
        role: "professor" as const,
      }
      setUser(user)
      localStorage.setItem("user", JSON.stringify(user))
      return
    }

    throw new Error("Invalid credentials")
  }

  const signup = async (name: string, email: string, password: string, role: string) => {
    // In a real app, you would make an API call to your backend
    // This is a mock implementation for demonstration purposes

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newUser = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      email,
      role: role as "student" | "professor",
    }

    setUser(newUser)
    localStorage.setItem("user", JSON.stringify(newUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  return <AuthContext.Provider value={{ user, loading, login, signup, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

