"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

        <Tabs defaultValue={initialTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{courses.filter((c) => c.status === "active").length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{courses.reduce((acc, course) => acc + course.students, 0)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{assignments.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Submission Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(
                      (assignments.reduce((acc, a) => acc + a.submissionsCount, 0) /
                        assignments.reduce((acc, a) => acc + a.totalStudents, 0)) *
                        100,
                    )}
                    %
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Recent Assignments</CardTitle>
                  <CardDescription>Your most recent assignments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {assignments.map((assignment) => (
                      <div key={assignment.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{assignment.title}</p>
                          <p className="text-sm text-gray-500">{assignment.course}</p>
                        </div>
                        <div>
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                            {assignment.submissionsCount}/{assignment.totalStudents} submitted
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Course Overview</CardTitle>
                  <CardDescription>Status of your courses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {courses.map((course) => (
                      <div key={course.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{course.title}</p>
                          <p className="text-sm text-gray-500">{course.students} students enrolled</p>
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            course.status === "active"
                              ? "bg-green-100 text-green-800"
                              : course.status === "draft"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="courses" className="space-y-4">
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
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          course.status === "active"
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
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Assignments</CardTitle>
                <CardDescription>Manage your course assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between border-b pb-4">
                      <div>
                        <p className="font-medium">{assignment.title}</p>
                        <p className="text-sm text-gray-500">{assignment.course}</p>
                        <p className="text-sm text-gray-500">
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                          {assignment.submissionsCount}/{assignment.totalStudents} submitted
                        </span>
                        <Button variant="outline" size="sm">
                          Grade
                        </Button>
                        <Button size="sm">View</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

