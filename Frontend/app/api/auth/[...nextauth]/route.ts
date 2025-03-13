import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import type { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      // Send properties to the client
      if (session.user) {
        // @ts-ignore
        session.user.id = token.sub
        // @ts-ignore
        session.user.role = token.role || null
      }
      return session
    },
    async jwt({ token, user, account, profile, trigger, session }) {
      // Persist the role info to the token
      if (trigger === "update" && session?.role) {
        token.role = session.role
      }

      // If this is a sign-in event, check if user exists and get role
      if (trigger === "signIn" && account?.provider === "google") {
        try {
          // First, store the user in the database (this will be a no-op if user exists)
          await fetch(`${process.env.FASTAPI_URL}/auth/google`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: token.sub,
              email: token.email,
              name: token.name,
            }),
          })

          // Then, check if the user has a role
          const roleResponse = await fetch(
            `${process.env.FASTAPI_URL}/users/role?email=${encodeURIComponent(token.email as string)}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            },
          )

          if (roleResponse.ok) {
            const data = await roleResponse.json()
            if (data.role) {
              token.role = data.role
            }
          }
        } catch (error) {
          console.error("Error during API calls:", error)
        }
      }

      return token
    },
  },
  pages: {
    signIn: "/login",
    newUser: "/role-selection",
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
