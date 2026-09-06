import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import { sendEmployerApplicationAlert } from "@/lib/email"
import { sendSeekerApplicationWhatsApp, sendEmployerApplicationWhatsApp } from "@/lib/whatsapp"
import { sendPushToUser } from "@/lib/push"

export async function POST(req: NextRequest) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ error: "Login required", code: "UNAUTHENTICATED" }, { status: 401 })
  }

  const { jobId } = await req.json()
  if (!jobId) {
    return NextResponse.json({ error: "Missing jobId" }, { status: 400 })
  }

  const dbUser = await prisma.user.findUnique({ where: { id: session.uid } })
  if (!dbUser || dbUser.role !== "SEEKER") {
    return NextResponse.json({ error: "Only job seekers can apply", code: "NOT_SEEKER" }, { status: 403 })
  }

  const profile = await prisma.seekerProfile.findUnique({ where: { userId: session.uid } })
  if (!profile) {
    return NextResponse.json({ error: "Complete your profile first", code: "NO_PROFILE" }, { status: 403 })
  }

  const job = await prisma.jobListing.findUnique({
    where: { id: jobId },
    include: {
      employer: {
        select: { userId: true, companyName: true, contactPerson: true, contactPhone: true },
      },
    },
  })
  if (!job || job.status !== "ACTIVE") {
    return NextResponse.json({ error: "Job not available" }, { status: 404 })
  }

  let application
  try {
    application = await prisma.application.create({
      data: { jobId, seekerId: profile.id },
    })
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "Already applied", code: "DUPLICATE" }, { status: 409 })
    }
    throw err
  }

  // In-app notification for employer
  const employerUser = await prisma.user.findUnique({ where: { id: job.employer.userId } })
  if (employerUser) {
    await prisma.notification.create({
      data: {
        userId: employerUser.id,
        type: "NEW_APPLICATION",
        title: `New application for "${job.title}"`,
        body: `${profile.name} has applied for your job posting.`,
        data: { applicationId: application.id, jobId: job.id, jobTitle: job.title },
      },
    })

    sendPushToUser(employerUser.id, {
      title: `New application for "${job.title}"`,
      body: `${profile.name} has applied for your job posting.`,
      data: { applicationId: application.id, type: "NEW_APPLICATION" }
    })
  }

  // Fire-and-forget notifications — email + WhatsApp for both seeker and employer
  ;(async () => {
    try {
      const [seekerUser, employerDbUser] = await Promise.all([
        prisma.user.findUnique({ where: { id: session.uid }, select: { phone: true } }),
        prisma.user.findUnique({ where: { id: job.employer.userId }, select: { email: true } }),
      ])

      await Promise.allSettled([
        // Employer email
        employerDbUser?.email
          ? sendEmployerApplicationAlert({
              employerEmail: employerDbUser.email,
              employerName: job.employer.contactPerson ?? job.employer.companyName,
              jobTitle: job.title,
              seekerName: profile.name,
              applicationId: application.id,
            })
          : Promise.resolve(),
        // Seeker WhatsApp — application confirmation
        seekerUser?.phone
          ? sendSeekerApplicationWhatsApp(seekerUser.phone, profile.name, job.title, job.employer.companyName)
          : Promise.resolve(),
        // Employer WhatsApp — new application alert
        job.employer.contactPhone
          ? sendEmployerApplicationWhatsApp(
              job.employer.contactPhone,
              job.employer.contactPerson ?? job.employer.companyName,
              profile.name,
              job.title,
            )
          : Promise.resolve(),
      ])
    } catch (err) {
      console.error("Application notifications failed:", err)
    }
  })()

  return NextResponse.json({ success: true, applicationId: application.id })
}
