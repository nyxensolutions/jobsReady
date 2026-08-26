import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"

// POST /api/seeker/push-token — register this device's FCM token for push notifications.
export async function POST(req: NextRequest) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { token } = await req.json()
  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "token required" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.uid }, select: { fcmTokens: true } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  if (!user.fcmTokens.includes(token)) {
    await prisma.user.update({
      where: { id: session.uid },
      data: { fcmTokens: { push: token } },
    })
  }

  return NextResponse.json({ success: true })
}

// DELETE /api/seeker/push-token — unregister this device (e.g. on logout).
export async function DELETE(req: NextRequest) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { token } = await req.json()
  if (!token || typeof token !== "string") {
    return NextResponse.json({ error: "token required" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { id: session.uid }, select: { fcmTokens: true } })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  await prisma.user.update({
    where: { id: session.uid },
    data: { fcmTokens: user.fcmTokens.filter((t) => t !== token) },
  })

  return NextResponse.json({ success: true })
}
