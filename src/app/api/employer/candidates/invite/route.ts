import { NextRequest, NextResponse } from "next/server"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db"
import { sendCandidateInviteEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  if (!dbUser || dbUser.role !== "EMPLOYER") return NextResponse.json({ error: "Employers only" }, { status: 403 })

  const employer = await prisma.employerProfile.findUnique({ where: { userId: user.id } })
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

  // Send email invite — fire and forget
  ;(async () => {
    try {
      const admin = await createAdminClient()
      const { data: { user: seekerAuthUser } } = await admin.auth.admin.getUserById(seekerProfile.userId)
      const email = seekerAuthUser?.email
      if (email && !email.endsWith("@phone.jobsready.in")) {
        await sendCandidateInviteEmail({
          seekerEmail: email,
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
