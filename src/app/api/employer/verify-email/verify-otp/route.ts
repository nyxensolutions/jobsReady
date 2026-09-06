import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { otp } = await req.json()
  if (!otp || typeof otp !== "string") {
    return NextResponse.json({ error: "Code is required" }, { status: 400 })
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.uid },
    select: {
      id: true,
      emailVerifyToken: true,
      emailVerifyExpires: true,
      emailVerified: true,
    },
  })
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 })

  if (dbUser.emailVerified) {
    return NextResponse.json({ success: true }) // already verified
  }

  if (!dbUser.emailVerifyToken || !dbUser.emailVerifyExpires) {
    return NextResponse.json({ error: "No verification code found. Request a new one." }, { status: 422 })
  }

  if (new Date() > dbUser.emailVerifyExpires) {
    return NextResponse.json({ error: "Code expired. Request a new one." }, { status: 410 })
  }

  if (dbUser.emailVerifyToken !== otp.trim()) {
    return NextResponse.json({ error: "Incorrect code. Please try again." }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: dbUser.id },
    data: {
      emailVerified: true,
      emailVerifyToken: null,
      emailVerifyExpires: null,
    },
  })

  return NextResponse.json({ success: true })
}
