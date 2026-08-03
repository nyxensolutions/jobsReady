import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const notifications = await prisma.notification.findMany({
    where: { userId: session.uid },
    orderBy: { createdAt: "desc" },
    take: 30,
  })
  return NextResponse.json(notifications)
}

export async function PATCH() {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await prisma.notification.updateMany({ where: { userId: session.uid, isRead: false }, data: { isRead: true } })
  return NextResponse.json({ ok: true })
}
