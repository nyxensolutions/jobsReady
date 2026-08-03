import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { adminAuth } from "@/lib/firebase/admin"
import { prisma } from "@/lib/db"

export async function DELETE() {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await prisma.user.delete({ where: { id: session.uid } })

  try {
    await adminAuth.deleteUser(session.uid)
  } catch (err) {
    console.error("Firebase user delete failed:", err)
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.delete("firebase-session")
  return response
}
