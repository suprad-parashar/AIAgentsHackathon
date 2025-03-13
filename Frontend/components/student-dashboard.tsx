"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"
import DashboardLayout from "./dashboard-layout"

interface Course {
  id: string
  name: string
  course_number: string
  structure: string
}

export default function StudentDashboard() {
  const { user, logout } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEnrolledCourses() {
      try {
        if (!user?.id) return

        const response = await fetch(`${process.env.NEXT_PUBLIC_FASTAPI_URL}/users/${user.id}/enrolled_courses`)
        if (response.ok) {
          const data = await response.json()
          setCourses(data || [])
        } else {
          console.error("Error fetching enrolled courses:", response.statusText)
          setCourses([])
        }
      } catch (error) {
        console.error("Error fetching enrolled courses:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEnrolledCourses()
  }, [user])

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Student Dashboard</h2>
        </div>

        {loading ? (
          <p>Loading courses...</p>
        ) : courses.length === 0 ? (
          <p>No courses enrolled.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card key={course.id}>
                <CardHeader>
                  <CardTitle>{course.name}</CardTitle>
                  <CardDescription>Course Number: {course.course_number}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Structure</span>
                      <span className="text-sm font-medium">{course.structure}</span>
                    </div>
                  </div>
                  <Link href={`/dashboard/courses/${course.id}`}>
                    <Button variant="outline" className="w-full">
                      View Course
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
