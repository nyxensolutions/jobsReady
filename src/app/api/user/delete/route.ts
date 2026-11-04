import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { adminAuth } from "@/lib/firebase/admin"
import { prisma } from "@/lib/db"

export async function DELETE() {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.uid },
      select: { seekerProfile: { select: { id: true } } },
    })
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })

    await prisma.$transaction(async (tx) => {
      // candidate_unlocks.seekerId carries no foreign key, so nothing removes
      // these rows when the seeker goes and they survive holding the seeker's
      // id. The employer side cascades through subscription.
      if (user.seekerProfile) {
        await tx.candidateUnlock.deleteMany({ where: { seekerId: user.seekerProfile.id } })
      }
      await tx.user.delete({ where: { id: session.uid } })
    })
  } catch (err) {
    // This used to throw straight out of the handler, so a failed delete was
    // an unhandled 500 with nothing logged.
    console.error("[user/delete] account deletion failed:", err)
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
  }

  try {
    await adminAuth.deleteUser(session.uid)
  } catch (err) {
    console.error("Firebase user delete failed:", err)
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.delete("firebase-session")
  return response
}
