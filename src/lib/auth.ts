import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { supabase } from "./supabase"

export const authOptions: NextAuthOptions = {
  // Remove PrismaAdapter to avoid DB connection issues
  // Using JWT strategy with Supabase REST API for user lookups
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: "__Secure-next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
        // Share cookie across all subdomains of tphc.org.ng
        domain: process.env.NODE_ENV === "production" ? ".tphc.org.ng" : undefined,
      },
    },
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

          const email = credentials.email.toLowerCase()
          console.log("[AUTH] Attempting login for:", email)

          // Use Supabase REST API instead of Prisma (works over HTTPS from Vercel)
          const { data: users, error } = await supabase
            .from("users")
            .select("id, email, password_hash, full_name, avatar_url, role, is_active")
            .eq("email", email)
            .limit(1)

          if (error) {
            console.error("[AUTH] Supabase query error:", error.message)
            return null
          }

          const user = users?.[0]

          if (!user) {
            console.error("[AUTH] User not found:", email)
            return null
          }

          if (!user.password_hash) {
            console.error("[AUTH] User has no password hash:", user.email)
            return null
          }

          if (!user.is_active) {
            console.error("[AUTH] User account deactivated:", user.email)
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password_hash
          )

          console.log("[AUTH] Password valid:", isPasswordValid)

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.full_name,
            image: user.avatar_url,
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
        const { data: existingUsers } = await supabase
          .from("users")
          .select("id, is_active")
          .eq("email", user.email!)
          .limit(1)

        const existingUser = existingUsers?.[0]

        if (!existingUser) {
          const { error } = await supabase
            .from("users")
            .insert({
              email: user.email!,
              full_name: user.name ?? "",
              avatar_url: user.image,
              role: "member",
              is_verified: true,
              is_active: true,
            })
          if (error) {
            console.error("[AUTH] Failed to create Google user:", error.message)
            return false
          }
        } else if (!existingUser.is_active) {
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
