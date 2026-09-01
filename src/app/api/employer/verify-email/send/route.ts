import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import { sendEmailVerification } from "@/lib/email"
import { randomUUID } from "crypto"

export async function POST(req: NextRequest) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Allow updating email if provided in body (for phone-only users)
  let newEmail: string | null = null
  try {
    const body = await req.json()
    newEmail = typeof body.email === "string" ? body.email.trim().toLowerCase() : null
  } catch {
    // body may be empty — that's fine
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.uid },
    select: { id: true, email: true, emailVerified: true, emailVerifyExpires: true },
  })
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 })

  if (dbUser.emailVerified) {
    return NextResponse.json({ error: "Email already verified" }, { status: 409 })
  }

  const emailToVerify = newEmail ?? dbUser.email
  if (!emailToVerify) {
    return NextResponse.json({ error: "No email address on file" }, { status: 422 })
  }

  // Throttle: don't re-send if one was issued in the last 2 minutes
  if (
    dbUser.emailVerifyExpires &&
    dbUser.emailVerifyExpires.getTime() > Date.now() + 22 * 60 * 60 * 1000 // token issued < 2 min ago
  ) {
    return NextResponse.json({ error: "Please wait before requesting another email" }, { status: 429 })
  }

  const token = randomUUID()
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  // If a new email was supplied by a phone-only user, store it (not yet verified)
  await prisma.user.update({
    where: { id: dbUser.id },
    data: {
      ...(newEmail ? { email: newEmail } : {}),
      emailVerifyToken: token,
      emailVerifyExpires: expires,
    },
  })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const verifyUrl = `${appUrl}/api/employer/verify-email/confirm?token=${token}`

  // Get employer's name for the email
  const employer = await prisma.employerProfile.findUnique({
    where: { userId: dbUser.id },
    select: { contactPerson: true, companyName: true },
  })
  const name = employer?.contactPerson || employer?.companyName || "there"

  await sendEmailVerification({ toEmail: emailToVerify, toName: name, verifyUrl })

  return NextResponse.json({ success: true, email: emailToVerify })
}
