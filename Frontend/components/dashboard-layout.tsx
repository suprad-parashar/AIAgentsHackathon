"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { BookOpen, Bot, Home, LogOut, Menu, User, X } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
  user: any
  onLogout: () => void
}

export default function DashboardLayout({ children, user, onLogout }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white">
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <span className="font-bold text-lg">EduPortal</span>
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <nav className="space-y-1">
              <Link
                href="/dashboard"
                className="flex items-center px-2 py-2 text-base font-medium rounded-md hover:bg-gray-100"
              >
                <Home className="mr-3 h-6 w-6 text-gray-500" />
                Dashboard
              </Link>
              <Link
                href="/dashboard/profile"
                className="flex items-center px-2 py-2 text-base font-medium rounded-md hover:bg-gray-100"
              >
                <User className="mr-3 h-6 w-6 text-gray-500" />
                Profile
              </Link>
              <Link
                href="/dashboard?tab=courses"
                className="flex items-center px-2 py-2 text-base font-medium rounded-md hover:bg-gray-100"
              >
                <BookOpen className="mr-3 h-6 w-6 text-gray-500" />
                My Courses
              </Link>
              <Link
                href="/dashboard/chat"
                className="flex items-center px-2 py-2 text-base font-medium rounded-md hover:bg-gray-100"
              >
                <Bot className="mr-3 h-6 w-6 text-gray-500" />
                AI Chat
              </Link>
              <button
                onClick={onLogout}
                className="flex w-full items-center px-2 py-2 text-base font-medium rounded-md hover:bg-gray-100 text-red-600"
              >
                <LogOut className="mr-3 h-6 w-6 text-red-500" />
                Logout
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex w-64 flex-col">
          <div className="flex min-h-0 flex-1 flex-col border-r bg-white">
            <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
              <div className="flex items-center flex-shrink-0 px-4">
                <span className="font-bold text-lg">EduPortal</span>
              </div>
              <nav className="mt-5 flex-1 space-y-1 px-2">
                <Link
                  href="/dashboard"
                  className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
                >
                  <Home className="mr-3 h-5 w-5 text-gray-500" />
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/profile"
                  className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
                >
                  <User className="mr-3 h-5 w-5 text-gray-500" />
                  Profile
                </Link>
                <Link
                  href="/dashboard?tab=courses"
                  className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
                >
                  <BookOpen className="mr-3 h-5 w-5 text-gray-500" />
                  My Courses
                </Link>
                <Link
                  href="/dashboard/chat"
                  className="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
                >
                  <Bot className="mr-3 h-5 w-5 text-gray-500" />
                  AI Chat
                </Link>
                <button
                  onClick={onLogout}
                  className="flex w-full items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-100 text-red-600"
                >
                  <LogOut className="mr-3 h-5 w-5 text-red-500" />
                  Logout
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white border-b">
          <button
            type="button"
            className="border-r px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex flex-1 justify-between px-4">
            <div className="flex flex-1"></div>
            <div className="ml-4 flex items-center md:ml-6">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <span className="sr-only">Open user menu</span>
                    <Avatar>
                      <AvatarFallback>{user.name ? user.name.charAt(0).toUpperCase() : "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
                  <DropdownMenuLabel className="text-sm font-normal text-gray-500">{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onLogout} className="text-red-600">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}

