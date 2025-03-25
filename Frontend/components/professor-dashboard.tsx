"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"
import DashboardLayout from "./dashboard-layout"
import { useRouter } from "next/navigation"

interface Course {
  id: string
  name: string  // Change from "title" to "name" to match API response
  course_number: string
  structure: string
}

export default function ProfessorDashboard({ user }: { user: any }) {
  const { logout } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (user?.email) {
      fetch(`${process.env.NEXT_PUBLIC_FASTAPI_URL}/users/${user.id}/taught_courses`)
        .then((res) => res.json())
        .then((data) => {
          setCourses(data || [])
        })
        .catch((error) => console.error("Error fetching taught courses:", error))
        .finally(() => setLoading(false))
    }
  }, [user])

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Professor Dashboard</h2>
          <div className="flex items-center space-x-2">
            <Button onClick={() => router.push("/dashboard/create-course")}>Create New Course</Button>
          </div>
        </div>

        {loading ? (
          <p>Loading courses...</p>
        ) : courses.length === 0 ? (
          <p>No courses found.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card key={course.id}>
                <CardHeader>
                  <CardTitle>{course.name}</CardTitle>
                  <CardDescription>Course Number: {course.course_number}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Link href={`/dashboard/courses/${course.id}`} className="flex-1">
                      <Button className="w-full">View</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
