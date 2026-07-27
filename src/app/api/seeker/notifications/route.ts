import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const dbUser = await prisma.user.findFirst({
    where: { OR: [{ email: user.email }, { phone: user.email?.split("@")[0] }] },
  })
  if (!dbUser) return NextResponse.json([])

  const notifications = await prisma.notification.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  })
  return NextResponse.json(notifications)
}

export async function PATCH() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const dbUser = await prisma.user.findFirst({
    where: { OR: [{ email: user.email }, { phone: user.email?.split("@")[0] }] },
  })
  if (!dbUser) return NextResponse.json({ ok: true })

  await prisma.notification.updateMany({ where: { userId: dbUser.id, isRead: false }, data: { isRead: true } })
  return NextResponse.json({ ok: true })
}
