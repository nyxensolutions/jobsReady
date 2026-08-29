import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"

/**
 * Every application across all of this employer's jobs.
 *
 * Same query the web /employer/responses page runs in its server component,
 * exposed as JSON for the mobile app.
 *
 * Query params:
 *   status - optional ApplicationStatus filter (APPLIED, SHORTLISTED, ...)
 *   jobId  - optional, restrict to a single listing
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const [dbUser, employer] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.uid } }),
    prisma.employerProfile.findUnique({ where: { userId: session.uid } }),
  ])
  if (!dbUser || dbUser.role !== "EMPLOYER") {
    return NextResponse.json({ error: "Employers only" }, { status: 403 })
  }
  if (!employer) return NextResponse.json({ error: "REGISTRATION_REQUIRED" }, { status: 403 })

  const { searchParams } = req.nextUrl
  const status = searchParams.get("status")?.trim()
  const jobId = searchParams.get("jobId")?.trim()

  const applications = await prisma.application.findMany({
    where: {
      job: { employerId: employer.id },
      ...(status ? { status: status as never } : {}),
      ...(jobId ? { jobId } : {}),
    },
    include: {
      seeker: {
        select: {
          id: true,
          name: true,
          city: true,
          experienceYears: true,
          skills: true,
          bio: true,
          photoUrl: true,
          resumeUrl: true,
          user: { select: { phone: true } },
        },
      },
      job: { select: { id: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(
    applications.map((app) => ({
      id: app.id,
      status: app.status,
      coverNote: app.coverNote,
      createdAt: app.createdAt,
      job: app.job,
      seeker: {
        id: app.seeker.id,
        name: app.seeker.name,
        city: app.seeker.city,
        experienceYears: app.seeker.experienceYears,
        skills: app.seeker.skills,
        bio: app.seeker.bio,
        photoUrl: app.seeker.photoUrl,
        resumeUrl: app.seeker.resumeUrl,
        phone: app.seeker.user?.phone ?? null,
      },
    }))
  )
}
