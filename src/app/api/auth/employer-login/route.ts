import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://jobs-ready.vercel.app"
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${appUrl}/auth/confirm?next=/employer/dashboard`,
    },
  })

  if (error) {
    console.error("Magic link error:", error.message)
    return NextResponse.json({ error: "Failed to send login email" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
