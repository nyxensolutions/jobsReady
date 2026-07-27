import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  if (!dbUser || dbUser.role !== "EMPLOYER") return NextResponse.json({ error: "Employers only" }, { status: 403 })

  const employer = await prisma.employerProfile.findUnique({ where: { userId: user.id } })
  if (!employer) return NextResponse.json({ error: "Profile not found" }, { status: 403 })

  const job = await prisma.jobListing.findFirst({
    where: { id, employerId: employer.id },
    select: { id: true, title: true, status: true },
  })
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 })

  const applications = await prisma.application.findMany({
    where: { jobId: id },
    include: {
      seeker: {
        select: {
          id: true, name: true, city: true, experienceYears: true,
          skills: true, bio: true, photoUrl: true, resumeUrl: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ job, applications })
}
