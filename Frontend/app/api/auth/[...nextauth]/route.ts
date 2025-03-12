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

