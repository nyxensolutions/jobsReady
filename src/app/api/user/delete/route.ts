import { NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db"

export async function DELETE() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await prisma.user.delete({ where: { id: user.id } })

  const admin = await createAdminClient()
  await admin.auth.admin.deleteUser(user.id)

  return NextResponse.json({ ok: true })
}
