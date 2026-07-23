import { NextRequest, NextResponse } from "next/server"
import { OTP_STORE } from "../send-otp/route"
import { createAdminClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  const { phone, otp } = await req.json()

  if (!phone || !otp) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  const record = OTP_STORE.get(phone)
  if (!record) {
    return NextResponse.json({ error: "No OTP requested for this number" }, { status: 400 })
  }
  if (Date.now() > record.expiresAt) {
    OTP_STORE.delete(phone)
    return NextResponse.json({ error: "OTP expired. Request a new one." }, { status: 400 })
  }
  if (record.otp !== otp) {
    return NextResponse.json({ error: "Incorrect OTP" }, { status: 400 })
  }

  OTP_STORE.delete(phone)

  // Upsert user in Supabase Auth using admin client
  const supabase = await createAdminClient()

  // Check if user exists in our DB
  let user = await prisma.user.findUnique({ where: { phone } })

  if (!user) {
    // Create Supabase auth user with phone
    const { data, error } = await supabase.auth.admin.createUser({
      phone,
      phone_confirm: true,
    })
    if (error && error.message !== "User already registered") {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const authId = data?.user?.id
    if (!authId) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    user = await prisma.user.create({
      data: { id: authId, phone, role: "SEEKER" },
    })
  }

  // Create a Supabase session for this user
  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email: `${phone}@phone.jobsready.in`,
  })

  // Return a simple success for now — session management via Supabase JWT
  return NextResponse.json({ success: true, userId: user.id })
}
