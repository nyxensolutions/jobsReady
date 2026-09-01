import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import { getPlanLimits } from "@/lib/subscription"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id: seekerId } = await params

    const employer = await prisma.employerProfile.findUnique({ where: { userId: session.uid } })
    if (!employer) return NextResponse.json({ error: "Employer not found" }, { status: 404 })

    // Already unlocked by this employer?
    const existing = await prisma.candidateUnlock.findUnique({
      where: { employerId_seekerId: { employerId: employer.id, seekerId } },
    })
    if (existing) {
      // Already unlocked — just return the contact info
      const seeker = await prisma.seekerProfile.findUnique({
        where: { id: seekerId },
        select: { name: true, user: { select: { phone: true, email: true } } },
      })
      return NextResponse.json({ success: true, contact: seeker?.user })
    }

    const limits = await getPlanLimits(employer.id)

    // Every employer has a subscription — the free launch plan if nothing
    // else — so this is purely a credit check. The free plan's credits are
    // effectively unlimited, which is what makes "Instant Candidate Unlocks"
    // on the plans page true.
    if (limits.unlocksLeft <= 0) {
      return NextResponse.json(
        {
          error: "UPGRADE_REQUIRED",
          message: "You have used all your candidate unlock credits. Upgrade to unlock more.",
        },
        { status: 402 }
      )
    }

    const seeker = await prisma.seekerProfile.findUnique({
      where: { id: seekerId },
      select: { name: true, user: { select: { phone: true, email: true } } },
    })
    if (!seeker) return NextResponse.json({ error: "Seeker not found" }, { status: 404 })

    if (limits.sub) {
      const subscriptionId = limits.sub.id
      await prisma.$transaction([
        prisma.candidateUnlock.create({
          data: { employerId: employer.id, seekerId, subscriptionId },
        }),
        prisma.subscription.update({
          where: { id: subscriptionId },
          data: { candidateUnlocksUsed: { increment: 1 } },
        }),
      ])
    }

    return NextResponse.json({ success: true, contact: seeker.user })
  } catch (err) {
    console.error("[seeker/contact]", err)
    return NextResponse.json({ error: "Failed to unlock contact" }, { status: 500 })
  }
}
