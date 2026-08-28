import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import { sendSeekerStatusUpdate } from "@/lib/email"
import { notifySeeker, MSG, WA } from "@/lib/sms"
import { sendPushToUser } from "@/lib/push"

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

  const body = await req.json()
  const status = body.status as string
  if (!ALLOWED_STATUSES.includes(status as Status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }
  const typedStatus = status as Status

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
    data: { status: typedStatus },
  })

  // ── In-app notification ───────────────────────────────────────────────────
  const NOTIFY_STATUSES: Status[] = ["VIEWED", "SHORTLISTED", "HIRED", "REJECTED"]
  if (NOTIFY_STATUSES.includes(typedStatus)) {
    const TITLES: Record<Status, string> = {
      VIEWED:      `${application.job.employer.companyName} viewed your application`,
      SHORTLISTED: `You've been shortlisted for "${application.job.title}" 🎉`,
      HIRED:       `You've been hired for "${application.job.title}" 🎉`,
      REJECTED:    `Update on your application for "${application.job.title}"`,
    }
    const BODIES: Record<Status, string> = {
      VIEWED:      "They're interested! Freshen up your profile to stand out.",
      SHORTLISTED: `${application.job.employer.companyName} shortlisted you. Expect a call soon.`,
      HIRED:       `${application.job.employer.companyName} selected you for the role. Congratulations!`,
      REJECTED:    "Keep applying — the right job is out there.",
    }
    const title = TITLES[typedStatus]
    const notifBody = BODIES[typedStatus]

    // In-app notification (non-blocking)
    void prisma.notification.create({
      data: {
        userId: application.seeker.userId,
        type: typedStatus,
        title,
        body: notifBody,
        data: { applicationId: id, jobTitle: application.job.title },
      },
    })

    // Mobile push — fire and forget
    sendPushToUser(application.seeker.userId, {
      title,
      body: notifBody,
      data: { applicationId: id, type: typedStatus },
    })

    // Email + SMS via Fast2SMS — fire and forget
    void (async () => {
      try {
        const seekerUser = await prisma.user.findUnique({
          where: { id: application.seeker.userId },
          select: { email: true, phone: true },
        })

        const title = application.job.title
        const company = application.job.employer.companyName
        const phone = seekerUser?.phone

        const SMS_MSGS: Record<Status, string> = {
          VIEWED:      MSG.seeker.viewed(title, company),
          SHORTLISTED: MSG.seeker.shortlisted(title, company),
          HIRED:       MSG.seeker.hired(title, company),
          REJECTED:    MSG.seeker.rejected(title),
        }

        const WA_SENDERS: Record<Status, () => Promise<void>> = {
          VIEWED:      () => WA.seeker.viewed(phone, title, company),
          SHORTLISTED: () => WA.seeker.shortlisted(phone, title, company),
          HIRED:       () => WA.seeker.hired(phone, title, company),
          REJECTED:    () => WA.seeker.rejected(phone, title),
        }

        await Promise.allSettled([
          seekerUser?.email
            ? sendSeekerStatusUpdate({
                seekerEmail: seekerUser.email,
                seekerName: application.seeker.name ?? "Job Seeker",
                jobTitle: title,
                companyName: company,
                status: typedStatus,
              })
            : Promise.resolve(),
          notifySeeker(phone, SMS_MSGS[typedStatus]),
          WA_SENDERS[typedStatus](),
        ])
      } catch (err) {
        console.error("[status/notify] Seeker notification failed:", err)
      }
    })()
  }

  return NextResponse.json({ success: true, status: updated.status })
}
