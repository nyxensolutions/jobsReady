import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
  }

  const supabase = await createAdminClient()

  // Send magic link email via Supabase
  const { error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback?next=/employer/dashboard`,
    },
  })

  if (error) {
    console.error("Magic link error:", error.message)
    return NextResponse.json({ error: "Failed to send login email" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
