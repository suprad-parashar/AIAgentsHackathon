import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link href="/" className="flex items-center justify-center">
          <span className="font-bold text-lg">EduPortal</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Welcome to EduPortal</h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                  A platform for professors and students to manage courses, assignments, and more.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/login">
                  <Button size="lg">Get Started</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6 space-y-2">
                  <h3 className="text-2xl font-bold">For Students</h3>
                  <p className="text-gray-500">Access course materials, submit assignments, and track your progress.</p>
                </div>
              </div>
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6 space-y-2">
                  <h3 className="text-2xl font-bold">For Professors</h3>
                  <p className="text-gray-500">Manage courses, create assignments, and evaluate student performance.</p>
                </div>
              </div>
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="p-6 space-y-2">
                  <h3 className="text-2xl font-bold">Easy Access</h3>
                  <p className="text-gray-500">Simple login and role-based dashboards for a seamless experience.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500">© {new Date().getFullYear()} EduPortal. All rights reserved.</p>
      </footer>
    </div>
  )
}

