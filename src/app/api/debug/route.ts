import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Test Supabase REST API connection
    const { data: users, error, count } = await supabase
      .from("users")
      .select("id, email, full_name, role, is_active, password_hash", { count: "exact" })
      .eq("email", "chinoify04@gmail.com")
      .limit(1)

    if (error) {
      return NextResponse.json({
        connected: false,
        error: error.message,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      }, { status: 500 })
    }

    const admin = users?.[0]

    return NextResponse.json({
      connected: true,
      adminExists: !!admin,
      adminHasPassword: !!admin?.password_hash,
      adminRole: admin?.role,
      adminIsActive: admin?.is_active,
      passwordHashLength: admin?.password_hash?.length,
      nextauthUrl: process.env.NEXTAUTH_URL,
      hasSecret: !!process.env.NEXTAUTH_SECRET,
    })
  } catch (error: any) {
    return NextResponse.json({
      connected: false,
      error: error.message,
    }, { status: 500 })
  }
}
