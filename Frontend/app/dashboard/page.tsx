"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import StudentDashboard from "@/components/student-dashboard"
import ProfessorDashboard from "@/components/professor-dashboard"
import LoadingSpinner from "@/components/loading-spinner"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = searchParams.get("tab") || "overview"

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return null
  }

  return (
    <div>
      {user.role === "student" ? (
        <StudentDashboard user={user} initialTab={initialTab} />
      ) : (
        <ProfessorDashboard user={user} initialTab={initialTab} />
      )}
    </div>
  )
}

