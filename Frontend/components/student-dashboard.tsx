"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/context/auth-context"
import DashboardLayout from "./dashboard-layout"

interface Course {
  id: string
  title: string
  instructor: string
  progress: number
}

interface Assignment {
  id: string
  title: string
  course: string
  dueDate: string
  status: "completed" | "pending" | "overdue"
}

const mockCourses: Course[] = [
  { id: "1", title: "Introduction to Computer Science", instructor: "Dr. Smith", progress: 65 },
  { id: "2", title: "Calculus I", instructor: "Dr. Johnson", progress: 42 },
  { id: "3", title: "Physics 101", instructor: "Dr. Williams", progress: 78 },
]

const mockAssignments: Assignment[] = [
  {
    id: "1",
    title: "Programming Assignment 1",
    course: "Introduction to Computer Science",
    dueDate: "2023-04-15",
    status: "completed",
  },
  { id: "2", title: "Problem Set 3", course: "Calculus I", dueDate: "2023-04-20", status: "pending" },
  { id: "3", title: "Lab Report 2", course: "Physics 101", dueDate: "2023-04-10", status: "overdue" },
]

export default function StudentDashboard({ user, initialTab = "overview" }: { user: any; initialTab?: string }) {
  const { logout } = useAuth()
  const [courses] = useState<Course[]>(mockCourses)
  const [assignments] = useState<Assignment[]>(mockAssignments)

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Student Dashboard</h2>
          <div className="flex items-center space-x-2">
            <Button>Enroll in Course</Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription>Instructor: {course.instructor}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Progress</span>
                    <span className="text-sm font-medium">{course.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${course.progress}%` }}></div>
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
      </div>
    </DashboardLayout>
  )
}

