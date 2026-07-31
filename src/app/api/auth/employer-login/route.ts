import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { sendEmployerMagicLink } from "@/lib/email"

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://jobs-ready.vercel.app"
  const supabase = await createAdminClient()

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: {
      redirectTo: `${appUrl}/auth/confirm?next=/employer/dashboard`,
    },
  })

  if (error || !data?.properties?.action_link) {
    console.error("Generate magic link error:", error?.message)
    return NextResponse.json({ error: "Failed to generate login link" }, { status: 500 })
  }

  try {
    await sendEmployerMagicLink({ email, magicLink: data.properties.action_link })
  } catch (err: any) {
    console.error("Send magic link email error:", err.message)
    return NextResponse.json({ error: "Failed to send login email" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
