import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const dbUser = await prisma.user.findUnique({ where: { id: session.uid } })
  if (!dbUser || dbUser.role !== "EMPLOYER") return NextResponse.json({ error: "Employers only" }, { status: 403 })

  const employer = await prisma.employerProfile.findUnique({ where: { userId: session.uid } })
  if (!employer) return NextResponse.json({ error: "Profile not found" }, { status: 403 })

  const job = await prisma.jobListing.findFirst({ where: { id, employerId: employer.id } })
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 })

  const { action } = await req.json() // "close" | "repost"

  if (action === "close") {
    if (job.status === "CLOSED") return NextResponse.json({ error: "Already closed" }, { status: 400 })
    await prisma.jobListing.update({ where: { id }, data: { status: "CLOSED" } })
    return NextResponse.json({ success: true, status: "CLOSED" })
  }

  if (action === "repost") {
    if (!["CLOSED", "EXPIRED", "REJECTED"].includes(job.status)) {
      return NextResponse.json({ error: "Only closed, expired, or rejected jobs can be reposted" }, { status: 400 })
    }
    await prisma.jobListing.update({
      where: { id },
      data: {
        status: "PENDING_REVIEW",
        publishedAt: null,
        expiresAt: null,
      },
    })
    return NextResponse.json({ success: true, status: "PENDING_REVIEW" })
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 })
}
