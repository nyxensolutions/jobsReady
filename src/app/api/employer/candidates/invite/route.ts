import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import { sendCandidateInviteEmail } from "@/lib/email"
import { sendPushToUser } from "@/lib/push"

export async function POST(req: NextRequest) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const dbUser = await prisma.user.findUnique({ where: { id: session.uid } })
  if (!dbUser || dbUser.role !== "EMPLOYER") return NextResponse.json({ error: "Employers only" }, { status: 403 })

  const employer = await prisma.employerProfile.findUnique({ where: { userId: session.uid } })
  if (!employer) return NextResponse.json({ error: "Profile not found" }, { status: 403 })

  const { seekerProfileId, jobId } = await req.json()
  if (!seekerProfileId || !jobId) return NextResponse.json({ error: "Missing seekerProfileId or jobId" }, { status: 400 })

  // Verify job belongs to this employer and is active
  const job = await prisma.jobListing.findFirst({
    where: { id: jobId, employerId: employer.id, status: "ACTIVE" },
    select: { id: true, title: true, cityId: true, city: { select: { name: true } } },
  })
  if (!job) return NextResponse.json({ error: "Job not found or not active" }, { status: 404 })

  // Get seeker's userId for the notification
  const seekerProfile = await prisma.seekerProfile.findUnique({
    where: { id: seekerProfileId },
    select: { userId: true, name: true },
  })
  if (!seekerProfile) return NextResponse.json({ error: "Candidate not found" }, { status: 404 })

  // Create in-app notification for seeker
  await prisma.notification.create({
    data: {
      userId: seekerProfile.userId,
      type: "JOB_INVITE",
      title: `${employer.companyName} wants you to apply!`,
      body: `You've been invited to apply for "${job.title}" in ${job.city.name}. Tap to view the job.`,
      data: { jobId: job.id, jobTitle: job.title, companyName: employer.companyName },
    },
  })

  sendPushToUser(seekerProfile.userId, {
    title: `${employer.companyName} wants you to apply!`,
    body: `You've been invited to apply for "${job.title}" in ${job.city.name}. Tap to view the job.`,
    data: { jobId: job.id, type: "JOB_INVITE" }
  })

  // Send email invite if seeker has an email address — fire and forget
  ;(async () => {
    try {
      const seekerUser = await prisma.user.findUnique({ where: { id: seekerProfile.userId }, select: { email: true } })
      if (seekerUser?.email) {
        await sendCandidateInviteEmail({
          seekerEmail: seekerUser.email,
          seekerName: seekerProfile.name,
          jobTitle: job.title,
          companyName: employer.companyName,
          jobId: job.id,
        })
      }
    } catch (err) {
      console.error("Invite email failed:", err)
    }
  })()

  return NextResponse.json({ success: true })
}
