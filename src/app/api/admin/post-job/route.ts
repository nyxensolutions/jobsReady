import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { assertAdmin } from "@/lib/admin"
import { salaryRangeError } from "@/lib/salary"

export async function POST(req: NextRequest) {
  if (!await assertAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const {
    employerUserId,
    title,
    categorySlug,
    citySlug,
    jobType,
    description,
    salaryMin,
    salaryMax,
    salaryUnit,
    vacancies,
    experienceMin,
    qualificationRequired,
    requirements,
    perks,
    status = "ACTIVE",
  } = body

  if (!employerUserId || !title?.trim() || !categorySlug || !citySlug || !jobType || !description?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const salaryError = salaryRangeError(salaryMin, salaryMax)
  if (salaryError) return NextResponse.json({ error: salaryError }, { status: 400 })

  const employer = await prisma.employerProfile.findUnique({ where: { userId: employerUserId } })
  if (!employer) return NextResponse.json({ error: "Employer profile not found" }, { status: 404 })

  const [category, city] = await Promise.all([
    prisma.category.findUnique({ where: { slug: categorySlug } }),
    prisma.city.findUnique({ where: { slug: citySlug } }),
  ])

  if (!category) return NextResponse.json({ error: "Invalid category" }, { status: 400 })
  if (!city) return NextResponse.json({ error: "Invalid city" }, { status: 400 })

  const finalStatus = status === "ACTIVE" ? "ACTIVE" : "PENDING_REVIEW"

  const job = await prisma.jobListing.create({
    data: {
      employerId: employer.id,
      categoryId: category.id,
      cityId: city.id,
      title: title.trim(),
      description: description.trim(),
      requirements: Array.isArray(requirements) ? requirements.filter(Boolean) : [],
      perks: Array.isArray(perks) ? perks.filter(Boolean) : [],
      jobType,
      salaryMin: salaryMin ? parseInt(salaryMin) : null,
      salaryMax: salaryMax ? parseInt(salaryMax) : null,
      salaryUnit: salaryUnit ?? "monthly",
      vacancies: parseInt(vacancies) || 1,
      experienceMin: parseFloat(experienceMin) || 0,
      qualificationRequired: qualificationRequired?.trim() || null,
      status: finalStatus,
      isHighReach: false,
    },
  })

  return NextResponse.json({ success: true, jobId: job.id })
}
