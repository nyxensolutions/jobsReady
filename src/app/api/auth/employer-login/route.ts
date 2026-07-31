import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm?next=/employer/dashboard`,
    },
  })

  if (error) {
    console.error("Magic link error:", error.message, error.status, JSON.stringify(error))
    return NextResponse.json({ error: error.message ?? "Failed to send login email" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
