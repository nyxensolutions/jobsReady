import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const seeker = await prisma.seekerProfile.findUnique({ where: { userId: session.uid } })
  if (!seeker) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const app = await prisma.application.findFirst({ where: { id, seekerId: seeker.id } })
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (app.status !== "APPLIED") return NextResponse.json({ error: "Cannot withdraw — application already reviewed" }, { status: 400 })

  await prisma.application.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
