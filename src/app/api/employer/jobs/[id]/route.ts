import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import { isAreaInCity } from "@/lib/areas"

async function getEmployerJob(userId: string, jobId: string) {
  const employer = await prisma.employerProfile.findUnique({ where: { userId } })
  if (!employer) return null
  return prisma.jobListing.findFirst({ where: { id: jobId, employerId: employer.id } })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const dbUser = await prisma.user.findUnique({ where: { id: session.uid } })
  if (!dbUser || dbUser.role !== "EMPLOYER") return NextResponse.json({ error: "Employers only" }, { status: 403 })

  const job = await getEmployerJob(session.uid, id)
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 })
  if (job.status === "CLOSED" || job.status === "EXPIRED") {
    return NextResponse.json({ error: "Cannot edit a closed or expired job. Use Repost instead." }, { status: 400 })
  }

  const body = await req.json()
  const {
    title, categorySlug, citySlug, jobType,
    salaryMin, salaryMax, salaryUnit, vacancies,
    experienceMin, qualificationRequired, description, requirements, perks, pincode,
    area,
  } = body

  if (!title || !categorySlug || !citySlug || !jobType || !description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const [category, city] = await Promise.all([
    prisma.category.findUnique({ where: { slug: categorySlug } }),
    prisma.city.findUnique({ where: { slug: citySlug } }),
  ])
  if (!category) return NextResponse.json({ error: "Invalid category" }, { status: 400 })
  if (!city) return NextResponse.json({ error: "Invalid city" }, { status: 400 })

  /**
   * An edit can move the job to another city, so the area is re-checked
   * against the new one. A stale area is the bad case: the job moves to
   * Hyderabad and keeps saying Okhla, which sends a seeker across the country.
   */
  let areaSlug: string | null = null
  if (typeof area === "string" && area.trim()) {
    areaSlug = area.trim()
    if (!isAreaInCity(areaSlug, city.slug)) {
      return NextResponse.json(
        { error: `"${areaSlug}" is not an area in ${city.name}.` },
        { status: 400 },
      )
    }
  }

  // Any edit resets to PENDING_REVIEW (re-review by admin)
  const updated = await prisma.jobListing.update({
    where: { id },
    data: {
      title: title.trim(),
      categoryId: category.id,
      cityId: city.id,
      jobType,
      salaryMin: salaryMin ? parseInt(salaryMin) : null,
      salaryMax: salaryMax ? parseInt(salaryMax) : null,
      salaryUnit: salaryUnit ?? "monthly",
      vacancies: parseInt(vacancies) || 1,
      experienceMin: parseInt(experienceMin) || 0,
      qualificationRequired: qualificationRequired ?? null,
      description: description.trim(),
      requirements: Array.isArray(requirements) ? requirements.filter(Boolean) : [],
      perks: Array.isArray(perks) ? perks.filter(Boolean) : [],
      pincode: pincode?.trim() || null,
      area: areaSlug,
      status: "PENDING_REVIEW",
      publishedAt: null,
    },
  })

  return NextResponse.json({ success: true, jobId: updated.id })
}
