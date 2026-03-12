import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { supabase } from "@/lib/supabase"

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { fullName, email, password, phone } = parsed.data

    // Check if user exists using Supabase REST API
    const { data: existingUsers, error: lookupError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.toLowerCase())
      .limit(1)

    if (lookupError) {
      console.error("Registration lookup error:", lookupError)
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      )
    }

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    // Create user using Supabase REST API
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert({
        full_name: fullName,
        email: email.toLowerCase(),
        password_hash: passwordHash,
        phone: phone || null,
        role: "member",
        is_active: true,
        is_verified: false,
      })
      .select("id, email, full_name, role, created_at")
      .single()

    if (createError) {
      console.error("Registration create error:", createError)
      return NextResponse.json(
        { error: "Failed to create account" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: "Account created successfully", user: newUser },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
