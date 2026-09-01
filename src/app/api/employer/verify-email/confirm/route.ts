import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

  if (!token) {
    return NextResponse.redirect(`${base}/employer/setup/verify-email?error=invalid`)
  }

  const user = await prisma.user.findFirst({
    where: {
      emailVerifyToken: token,
      emailVerifyExpires: { gt: new Date() },
    },
    select: { id: true },
  })

  if (!user) {
    return NextResponse.redirect(`${base}/employer/setup/verify-email?error=expired`)
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerifyToken: null,
      emailVerifyExpires: null,
    },
  })

  return NextResponse.redirect(`${base}/employer/dashboard?verified=1`)
}
