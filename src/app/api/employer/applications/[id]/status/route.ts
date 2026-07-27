import { NextRequest, NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db"
import { sendSeekerShortlistAlert } from "@/lib/email"

const ALLOWED_STATUSES = ["VIEWED", "SHORTLISTED", "REJECTED", "HIRED"] as const
type Status = (typeof ALLOWED_STATUSES)[number]

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  if (!dbUser || dbUser.role !== "EMPLOYER") {
    return NextResponse.json({ error: "Employers only" }, { status: 403 })
  }

  const { status } = await req.json()
  if (!ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  // Verify the application belongs to one of this employer's jobs
  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      job: {
        select: {
          title: true,
          employer: { select: { userId: true, companyName: true } },
        },
      },
      seeker: { select: { userId: true, name: true } },
    },
  })

  if (!application || application.job.employer.userId !== user.id) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 })
  }

  const updated = await prisma.application.update({
    where: { id },
    data: { status: status as Status },
  })

  // In-app notification for seeker on shortlist/hire
  if (status === "SHORTLISTED" || status === "HIRED") {
    const title = status === "SHORTLISTED"
      ? `You've been shortlisted for "${application.job.title}"`
      : `You've been hired for "${application.job.title}" 🎉`
    const body = `${application.job.employer.companyName} has ${status === "SHORTLISTED" ? "shortlisted you" : "offered you the job"}. Expect a call soon.`

    await prisma.notification.create({
      data: {
        userId: application.seeker.userId,
        type: status,
        title,
        body,
        data: { applicationId: id, jobTitle: application.job.title },
      },
    })

    // Email + SMS the seeker — fire and forget
    ;(async () => {
      try {
        const admin = await createAdminClient()
        const { data: { user: seekerAuthUser } } = await admin.auth.admin.getUserById(application.seeker.userId)
        const seekerEmail = seekerAuthUser?.email

        // Email (only for non-phone accounts and only on shortlist)
        if (seekerEmail && !seekerEmail.endsWith("@phone.jobsready.in") && status === "SHORTLISTED") {
          await sendSeekerShortlistAlert({
            seekerEmail,
            seekerName: application.seeker.name,
            jobTitle: application.job.title,
            companyName: application.job.employer.companyName,
          })
        }

        // SMS via Fast2SMS (phone accounts — extract phone from synthetic email)
        const apiKey = process.env.FAST2SMS_API_KEY
        if (apiKey) {
          const phone = seekerAuthUser?.phone
            ?? (seekerEmail?.endsWith("@phone.jobsready.in") ? seekerEmail.split("@")[0] : null)
          if (phone && /^[6-9]\d{9}$/.test(phone)) {
            const smsText = status === "SHORTLISTED"
              ? `Congrats! You've been shortlisted for ${application.job.title} at ${application.job.employer.companyName}. Check Job Ready app for details.`
              : `Great news! You've been selected for ${application.job.title} at ${application.job.employer.companyName}. Expect a call soon!`
            await fetch("https://www.fast2sms.com/dev/bulkV2", {
              method: "POST",
              headers: { authorization: apiKey, "Content-Type": "application/json" },
              body: JSON.stringify({ route: "q", message: smsText, numbers: phone }),
            })
          }
        }
      } catch (err) {
        console.error("Seeker notification failed:", err)
      }
    })()
  }

  return NextResponse.json({ success: true, status: updated.status })
}
