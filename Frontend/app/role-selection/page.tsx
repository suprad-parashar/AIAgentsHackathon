"use client"

import type React from "react"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import LoadingSpinner from "@/components/loading-spinner"

export default function RoleSelectionPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [role, setRole] = useState<string>("student")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (status === "loading") {
    return <LoadingSpinner />
  }

  if (status === "unauthenticated") {
    router.push("/login")
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Update the session with the selected role
      await update({
        role: role,
      })

      // Redirect to dashboard after role selection
      router.push("/dashboard")
    } catch (error) {
      console.error("Error updating role:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Select Your Role</CardTitle>
          <CardDescription>Choose how you'll use EduPortal</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="text-center mb-6">
              <p>Welcome, {session?.user?.name}!</p>
              <p className="text-gray-500">Please select your role to continue</p>
            </div>

            <RadioGroup value={role} onValueChange={setRole} className="space-y-4">
              <div className="flex items-start space-x-3 border p-4 rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="student" id="student" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="student" className="text-base font-medium block">
                    I am a Student
                  </Label>
                  <p className="text-gray-500 text-sm">Access course materials and submit assignments</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 border p-4 rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="professor" id="professor" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="professor" className="text-base font-medium block">
                    I am a Professor
                  </Label>
                  <p className="text-gray-500 text-sm">Create courses and manage student progress</p>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : "Continue"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

