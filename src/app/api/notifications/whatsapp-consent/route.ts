import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"

/**
 * Records WhatsApp marketing consent for the signed-in user.
 *
 * Role-agnostic on purpose. Consent is consent to be messaged on a phone
 * number, and both sides of the marketplace have MARKETING templates that
 * depend on it: seeker_job_matches_v1 and seeker_invited_to_apply_v1 for
 * seekers, employer_plan_expiring_v1 for employers. One endpoint, one column.
 *
 * UTILITY templates — application status, job approved, payment receipt,
 * contact unlocked — must never be gated on this.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { optIn } = await req.json().catch(() => ({}))
  if (typeof optIn !== "boolean") {
    return NextResponse.json({ error: "optIn must be true or false" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.uid },
    select: { whatsappOptIn: true, whatsappOptInAt: true },
  })
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  await prisma.user.update({
    where: { id: session.uid },
    data: {
      whatsappOptIn: optIn,
      // Kept on withdrawal: when consent was last granted is the question
      // worth being able to answer later, and clearing it destroys the record.
      whatsappOptInAt: optIn ? new Date() : user.whatsappOptInAt,
    },
  })

  return NextResponse.json({ success: true, whatsappOptIn: optIn })
}
