import type React from "react"
import { NextAuthProvider } from "@/context/next-auth-provider"
import { AuthProvider } from "@/context/auth-context"
import "./globals.css"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "EduPortal - Learning Management System",
  description: "A platform for professors and students",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider>
          <AuthProvider>{children}</AuthProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}



import './globals.css'