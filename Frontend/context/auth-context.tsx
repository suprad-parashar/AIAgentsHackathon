"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  name: string
  email: string
  role: "student" | "professor"
  image?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  logout: () => void
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string, role: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") {
      setLoading(true)
      return
    }

    if (status === "authenticated" && session.user) {
      // Create user object from session data
      setUser({
        id: (session.user.id as string) || "",
        name: session.user.name || "",
        email: session.user.email || "",
        role: session.user.role as "student" | "professor",
        image: session.user.image || undefined,
      })
    } else {
      setUser(null)
    }

    setLoading(false)
  }, [session, status])

  // These functions are kept for backward compatibility with existing components
  const login = async (email: string, password: string) => {
    console.warn("Using legacy login method - should use NextAuth signIn instead")
    // Redirect to the login page which uses NextAuth
    router.push("/login")
    throw new Error("Legacy login not supported")
  }

  const signup = async (name: string, email: string, password: string, role: string) => {
    console.warn("Using legacy signup method - should use NextAuth signIn instead")
    // Redirect to the login page which uses NextAuth
    router.push("/login")
    throw new Error("Legacy signup not supported")
  }

  const logout = async () => {
    await signOut({ callbackUrl: "/" })
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

