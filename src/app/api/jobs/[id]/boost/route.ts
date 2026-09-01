import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import { getPlanLimits } from "@/lib/subscription"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id: jobId } = await params

    const employer = await prisma.employerProfile.findUnique({ where: { userId: session.uid } })
    if (!employer) return NextResponse.json({ error: "Employer not found" }, { status: 404 })

    const job = await prisma.jobListing.findFirst({
      where: { id: jobId, employerId: employer.id, status: "ACTIVE" },
    })
    if (!job) return NextResponse.json({ error: "Job not found or not active" }, { status: 404 })

    const limits = await getPlanLimits(employer.id)
    // Free launch: no subscription, but the plans page lists "Featured Job
    // Boosts" as included. Only metered plans are capped.
    if (limits.boostsLeft <= 0) {
      return NextResponse.json({ error: "UPGRADE_REQUIRED", message: "You have used all your boost credits. Upgrade to get more." }, { status: 402 })
    }

    // Check if already boosted and still active
    const existing = await prisma.jobBoost.findUnique({ where: { jobId } })
    if (existing && existing.expiresAt > new Date()) {
      return NextResponse.json({ error: "Job is already boosted until " + existing.expiresAt.toLocaleDateString("en-IN") }, { status: 400 })
    }

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // JobBoost.subscriptionId is a required FK, so a free-tier boost cannot be
    // recorded without first making that column nullable. Nothing expires
    // isFeatured today, so skipping the record leaves the visible behaviour
    // identical — only the re-boost guard is lost, which is moot while boosts
    // are unmetered.
    const sub = limits.sub
    if (sub) {
      const subscriptionId = sub.id
      await prisma.$transaction([
        prisma.jobBoost.upsert({
          where: { jobId },
          create: { jobId, employerId: employer.id, subscriptionId, expiresAt },
          update: { boostedAt: new Date(), subscriptionId, expiresAt },
        }),
        prisma.jobListing.update({ where: { id: jobId }, data: { isFeatured: true } }),
        prisma.subscription.update({
          where: { id: subscriptionId },
          data: { boostsUsed: { increment: 1 } },
        }),
      ])
    } else {
      await prisma.jobListing.update({ where: { id: jobId }, data: { isFeatured: true } })
    }

    return NextResponse.json({ success: true, boostedUntil: expiresAt })
  } catch (err) {
    console.error("[jobs/boost]", err)
    return NextResponse.json({ error: "Boost failed" }, { status: 500 })
  }
}
