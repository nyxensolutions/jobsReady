import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import { sendSeekerShortlistAlert } from "@/lib/email"

const ALLOWED_STATUSES = ["VIEWED", "SHORTLISTED", "REJECTED", "HIRED"] as const
type Status = (typeof ALLOWED_STATUSES)[number]

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const dbUser = await prisma.user.findUnique({ where: { id: session.uid } })
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

  if (!application || application.job.employer.userId !== session.uid) {
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
        const seekerUser = await prisma.user.findUnique({
          where: { id: application.seeker.userId },
          select: { email: true, phone: true },
        })

        // Email (only on shortlist and only if seeker has an email)
        if (seekerUser?.email && status === "SHORTLISTED") {
          await sendSeekerShortlistAlert({
            seekerEmail: seekerUser.email,
            seekerName: application.seeker.name,
            jobTitle: application.job.title,
            companyName: application.job.employer.companyName,
          })
        }

        // SMS via 2Factor.in transactional SMS
        const tfApiKey = process.env.TWOFACTOR_API_KEY
        const senderId = process.env.TWOFACTOR_SENDER_ID ?? "JBSRDY"
        if (tfApiKey && seekerUser?.phone && /^[6-9]\d{9}$/.test(seekerUser.phone)) {
          const msg = status === "SHORTLISTED"
            ? `Congrats! You have been shortlisted for ${application.job.title} at ${application.job.employer.companyName}. Check Jobs Ready app for details.`
            : `Great news! You have been selected for ${application.job.title} at ${application.job.employer.companyName}. Expect a call from them soon!`
          const url = `https://2factor.in/API/V1/${tfApiKey}/ADDON_SERVICES/SEND/TSMS`
            + `?From=${encodeURIComponent(senderId)}`
            + `&To=${seekerUser.phone}`
            + `&Msg=${encodeURIComponent(msg)}`
          const smsRes = await fetch(url)
          const smsData = await smsRes.json().catch(() => null)
          if (smsData?.Status !== "Success") {
            console.error("2Factor SMS failed:", smsData)
          }
        }
      } catch (err) {
        console.error("Seeker notification failed:", err)
      }
    })()
  }

  return NextResponse.json({ success: true, status: updated.status })
}
