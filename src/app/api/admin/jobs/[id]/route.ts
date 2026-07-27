import { NextRequest, NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db"
import { sendEmployerJobApprovedAlert, sendEmployerJobRejectedAlert } from "@/lib/email"

async function assertAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const dbUser = await prisma.user.findFirst({ where: { OR: [{ email: user.email }, { phone: user.email?.split("@")[0] }] } })
  return dbUser?.role === "ADMIN"
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  if (!await assertAdmin(supabase)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

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

    // Email — fire and forget
    ;(async () => {
      try {
        const admin = await createAdminClient()
        const { data: { user: empUser } } = await admin.auth.admin.getUserById(employerUserId)
        const email = empUser?.email
        if (email && !email.endsWith("@phone.jobsready.in")) {
          if (action === "approve") {
            await sendEmployerJobApprovedAlert({
              employerEmail: email,
              employerName: job.employer.contactPerson ?? job.employer.companyName,
              jobTitle: job.title,
              jobId: id,
            })
          } else {
            await sendEmployerJobRejectedAlert({
              employerEmail: email,
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
