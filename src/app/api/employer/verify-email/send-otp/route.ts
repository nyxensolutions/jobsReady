import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import { sendEmailOtp } from "@/lib/email"

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let email: string | null = null
  try {
    const body = await req.json()
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : null
  } catch {
    // empty body — will use email already on user record
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.uid },
    select: { id: true, email: true, emailVerified: true, emailVerifyExpires: true },
  })
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 })

  if (dbUser.emailVerified) {
    return NextResponse.json({ error: "Email already verified" }, { status: 409 })
  }

  const emailToVerify = email ?? dbUser.email
  if (!emailToVerify) {
    return NextResponse.json({ error: "Provide an email address" }, { status: 422 })
  }


  // User.email is unique, so pointing it at an address another account already
  // holds throws P2002 straight out of the handler as an opaque 500. This turns
  // that into something the employer can act on.
  if (email && email !== dbUser.email) {
    const taken = await prisma.user.findFirst({
      where: { email: email, id: { not: dbUser.id } },
      select: { id: true },
    })
    if (taken) {
      return NextResponse.json(
        { error: "That email address is already used by another account.", code: "EMAIL_IN_USE" },
        { status: 409 }
      )
    }
  }

  // Throttle: block re-sends within 2 minutes
  if (
    dbUser.emailVerifyExpires &&
    dbUser.emailVerifyExpires.getTime() > Date.now() + 8 * 60 * 1000 // issued < 2 min ago
  ) {
    return NextResponse.json({ error: "Please wait before requesting another code" }, { status: 429 })
  }

  const otp = generateOtp()
  const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  await prisma.user.update({
    where: { id: dbUser.id },
    data: {
      ...(email ? { email } : {}),
      emailVerifyToken: otp,
      emailVerifyExpires: expires,
    },
  })

  // Get name for greeting
  const employer = await prisma.employerProfile.findUnique({
    where: { userId: dbUser.id },
    select: { contactPerson: true, companyName: true },
  })
  const name = employer?.contactPerson || employer?.companyName || "there"

  await sendEmailOtp({ toEmail: emailToVerify, toName: name, otp })

  return NextResponse.json({ success: true, email: emailToVerify })
}
