import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import bcrypt from "bcryptjs"
import prisma from "./db"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "placeholder",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder",
      profile(profile) {
        return {
          id: profile.sub,
          email: profile.email,
          fullName: profile.name ?? "",
          avatarUrl: profile.picture,
          role: "member" as const,
          isVerified: true,
          isActive: true,
        }
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.error("[AUTH] Missing email or password")
            return null
          }

          console.log("[AUTH] Attempting login for:", credentials.email.toLowerCase())

          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
          })

          if (!user) {
            console.error("[AUTH] User not found:", credentials.email.toLowerCase())
            return null
          }

          if (!user.passwordHash) {
            console.error("[AUTH] User has no password hash:", user.email)
            return null
          }

          if (!user.isActive) {
            console.error("[AUTH] User account deactivated:", user.email)
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          )

          console.log("[AUTH] Password valid:", isPasswordValid)

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.fullName,
            image: user.avatarUrl,
            role: user.role,
          }
        } catch (error) {
          console.error("[AUTH] Error in authorize:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role ?? "member"
      }

      // Handle session update (e.g., after role change)
      if (trigger === "update" && session) {
        token.role = session.role ?? token.role
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
    async signIn({ user, account }) {
      // For OAuth sign-ins, check if user exists and create if not
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        })

        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email!,
              fullName: user.name ?? "",
              avatarUrl: user.image,
              role: "member",
              isVerified: true,
              isActive: true,
            },
          })
        } else if (!existingUser.isActive) {
          return false
        }
      }

      return true
    },
  },
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return bcrypt.compare(password, hashedPassword)
}
