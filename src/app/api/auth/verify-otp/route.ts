import { NextRequest, NextResponse } from "next/server"
import { otpGet, otpDelete } from "@/lib/otp-store"
import { createAdminClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db"

// Phone users get a synthetic email so we can issue magic-link sessions
function phoneEmail(phone: string) {
  return `${phone}@phone.jobsready.in`
}

export async function POST(req: NextRequest) {
  const { phone, otp, next } = await req.json()

  if (!phone || !otp) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const record = await otpGet(phone)
  if (!record) {
    return NextResponse.json({ error: "No OTP requested for this number" }, { status: 400 })
  }
  if (Date.now() > record.expiresAt) {
    await otpDelete(phone)
    return NextResponse.json({ error: "OTP expired. Request a new one." }, { status: 400 })
  }
  if (record.otp !== otp) {
    return NextResponse.json({ error: "Incorrect OTP" }, { status: 400 })
  }
  await otpDelete(phone)

  const supabase = await createAdminClient()
  const email = phoneEmail(phone)

  // Find existing DB user
  let dbUser = await prisma.user.findUnique({ where: { phone } })

  if (!dbUser) {
    // Create Supabase auth user with phone-derived email
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      phone,
      phone_confirm: true,
      user_metadata: { role: "SEEKER" },
    })

    let authId = data?.user?.id

    if (!authId) {
      // User already exists in Supabase — look up by email
      const { data: list } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
      const existing = list?.users?.find((u) => u.email === email)
      authId = existing?.id
    }

    if (!authId) {
      return NextResponse.json({ error: "Failed to create auth user" }, { status: 500 })
    }

    // Create DB user + empty seeker profile in one go
    dbUser = await prisma.user.create({ data: { id: authId, phone, role: "SEEKER" } })

    await prisma.seekerProfile.create({
      data: { userId: dbUser.id, name: phone }, // user fills name in profile page
    })
  } else {
    // Ensure Supabase user has the phone-derived email (for magic link)
    await supabase.auth.admin.updateUserById(dbUser.id, {
      email,
      email_confirm: true,
    }).catch(() => {}) // safe — ignore if email already set

    // Auto-create SeekerProfile if missing
    const exists = await prisma.seekerProfile.findUnique({ where: { userId: dbUser.id } })
    if (!exists) {
      await prisma.seekerProfile.create({ data: { userId: dbUser.id, name: phone } })
    }
  }

  // Generate a magic link → client will redirect to it → Supabase sets session cookies
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: {
      redirectTo: `${appUrl}/auth/confirm?next=${encodeURIComponent(next ?? "/jobs")}`,
    },
  })

  if (linkError || !linkData?.properties?.action_link) {
    console.error("generateLink error:", linkError?.message)
    return NextResponse.json({ error: "Failed to create session link" }, { status: 500 })
  }

  return NextResponse.json({ success: true, redirectUrl: linkData.properties.action_link })
}
