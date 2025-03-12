"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"
import DashboardLayout from "./dashboard-layout"
import { useRouter } from "next/navigation"

interface Course {
  id: string
  title: string
  students: number
  status: "active" | "draft" | "archived"
}

interface Assignment {
  id: string
  title: string
  course: string
  dueDate: string
  submissionsCount: number
  totalStudents: number
}

const mockCourses: Course[] = [
  { id: "1", title: "Introduction to Computer Science", students: 45, status: "active" },
  { id: "2", title: "Advanced Programming", students: 32, status: "active" },
  { id: "3", title: "Data Structures", students: 28, status: "draft" },
]

const mockAssignments: Assignment[] = [
  {
    id: "1",
    title: "Programming Assignment 1",
    course: "Introduction to Computer Science",
    dueDate: "2023-04-15",
    submissionsCount: 40,
    totalStudents: 45,
  },
  {
    id: "2",
    title: "Final Project",
    course: "Advanced Programming",
    dueDate: "2023-04-30",
    submissionsCount: 15,
    totalStudents: 32,
  },
  {
    id: "3",
    title: "Quiz 2",
    course: "Introduction to Computer Science",
    dueDate: "2023-04-10",
    submissionsCount: 42,
    totalStudents: 45,
  },
]

export default function ProfessorDashboard({ user, initialTab = "overview" }: { user: any; initialTab?: string }) {
  const { logout } = useAuth()
  const [courses] = useState<Course[]>(mockCourses)
  const [assignments] = useState<Assignment[]>(mockAssignments)
  const router = useRouter()

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Professor Dashboard</h2>
          <div className="flex items-center space-x-2">
            <Button onClick={() => router.push("/dashboard/create-course")}>Create New Course</Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription>{course.students} students enrolled</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${course.status === "active"
                        ? "bg-green-100 text-green-800"
                        : course.status === "draft"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                  >
                    {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" className="flex-1">
                    Edit
                  </Button>
                  <Link href={`/dashboard/courses/${course.id}`} className="flex-1">
                    <Button className="w-full">View</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

