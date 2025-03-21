"use client"

import { useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FaGoogle } from "react-icons/fa"
import LoadingSpinner from "@/components/loading-spinner"

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated") {
      // If user has a role, redirect to dashboard
      if (session?.user?.role) {
        router.push("/dashboard")
      } else {
        // If user is authenticated but has no role, redirect to role selection
        router.push("/role-selection")
      }
    }
  }, [session, status, router])

  const handleGoogleSignIn = () => {
    signIn("google")
  }

  if (status === "loading") {
    return <LoadingSpinner />
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to EduPortal</CardTitle>
          <CardDescription>Sign in to access your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button onClick={handleGoogleSignIn} className="w-full flex items-center justify-center gap-2">
            <FaGoogle />
            <span>Sign in with Google</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

