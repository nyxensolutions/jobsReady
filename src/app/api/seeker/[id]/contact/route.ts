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

    // Free launch: employers have no subscription, and the plans page promises
    // "Instant Candidate Unlocks — view contact details of any candidate for
    // free". Rejecting them here made that advertised feature unusable for
    // every current employer. Only metered plans are capped.
    if (limits.sub && limits.unlocksLeft <= 0) {
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

    // Only record and meter the unlock when a subscription is paying for it.
    // CandidateUnlock.subscriptionId is a required FK, so a free-tier unlock
    // cannot be written without first making that column nullable — and free
    // unlocks are unmetered, so there is no credit to draw down either way.
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
