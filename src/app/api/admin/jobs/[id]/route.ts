import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import { sendEmployerJobApprovedAlert, sendEmployerJobRejectedAlert } from "@/lib/email"
import { sendPushToUser } from "@/lib/push"

async function assertAdmin() {
  const session = await getServerSession()
  if (!session) return false
  const dbUser = await prisma.user.findUnique({ where: { id: session.uid } })
  return dbUser?.role === "ADMIN"
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!await assertAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { action, reason } = await req.json() // "approve" | "reject" | "feature"
  let data: any = {}

  if (action === "approve") {
    data = { status: "ACTIVE", publishedAt: new Date(), expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
  } else if (action === "reject") {
    data = { status: "REJECTED" }
  } else if (action === "deactivate") {
    data = { status: "CLOSED" }
  } else if (action === "reactivate") {
    data = { status: "PENDING_REVIEW" }
  } else if (action === "feature") {
    const job = await prisma.jobListing.findUnique({ where: { id } })
    data = { isFeatured: !job?.isFeatured }
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  }

  const job = await prisma.jobListing.update({
    where: { id },
    data,
    include: {
      employer: { select: { userId: true, companyName: true, contactPerson: true } },
    },
  })

  // Notify employer on approve or reject
  if (action === "approve" || action === "reject") {
    const employerUserId = job.employer.userId

    // In-app notification
    const notifTitle = action === "approve"
      ? `Your job "${job.title}" is now live!`
      : `Your job "${job.title}" needs changes`
    const notifBody = action === "approve"
      ? "Congratulations! Your job has been approved and is visible to candidates."
      : `Your job posting was not approved. ${reason ? `Reason: ${reason}` : "Please edit and resubmit."}`

    await prisma.notification.create({
      data: {
        userId: employerUserId,
        type: action === "approve" ? "JOB_APPROVED" : "JOB_REJECTED",
        title: notifTitle,
        body: notifBody,
        data: { jobId: id, jobTitle: job.title },
      },
    })

    sendPushToUser(employerUserId, {
      title: notifTitle,
      body: notifBody,
      data: { jobId: id, type: action === "approve" ? "JOB_APPROVED" : "JOB_REJECTED" }
    })

    // Email — fire and forget, use email stored in DB
    ;(async () => {
      try {
        const empUser = await prisma.user.findUnique({ where: { id: employerUserId }, select: { email: true } })
        if (empUser?.email) {
          if (action === "approve") {
            await sendEmployerJobApprovedAlert({
              employerEmail: empUser.email,
              employerName: job.employer.contactPerson ?? job.employer.companyName,
              jobTitle: job.title,
              jobId: id,
            })
          } else {
            await sendEmployerJobRejectedAlert({
              employerEmail: empUser.email,
              employerName: job.employer.contactPerson ?? job.employer.companyName,
              jobTitle: job.title,
              reason,
            })
          }
        }
      } catch (err) {
        console.error("Employer job status email failed:", err)
      }
    })()
  }

  return NextResponse.json(job)
}
