"use client"

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import DashboardLayout from "./dashboard-layout";

interface Course {
  id: string;
  title: string;
  instructor: string;
}

const mockCourses: Course[] = [
  { id: "1", title: "Introduction to Computer Science", instructor: "Dr. Smith" },
  { id: "2", title: "Calculus I", instructor: "Dr. Johnson" },
  { id: "3", title: "Physics 101", instructor: "Dr. Williams" },
];

export default function StudentDashboard({ user }: { user: any }) {
  const { logout } = useAuth();
  const [courses] = useState<Course[]>(mockCourses);
  const router = useRouter();

  return (
    <DashboardLayout user={user} onLogout={logout}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Student Dashboard</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <CardTitle>{course.title}</CardTitle>
                <CardDescription>Instructor: {course.instructor}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={`/dashboard/courses/${course.id}`}>
                  <Button className="w-full">View Course</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
