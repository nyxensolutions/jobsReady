import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const {
    title,
    categorySlug,
    citySlug,
    jobType,
    salaryMin,
    salaryMax,
    salaryUnit,
    vacancies,
    experienceMin,
    qualificationRequired,
    description,
    requirements,
    perks,
    pincode,
  } = body

  if (!title || !categorySlug || !citySlug || !jobType || !description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  if (!dbUser || dbUser.role !== "EMPLOYER") {
    return NextResponse.json({ error: "Only employers can post jobs" }, { status: 403 })
  }

  const employer = await prisma.employerProfile.findUnique({ where: { userId: user.id } })
  if (!employer) {
    return NextResponse.json({ error: "Complete employer registration first" }, { status: 403 })
  }

  const [category, city] = await Promise.all([
    prisma.category.findUnique({ where: { slug: categorySlug } }),
    prisma.city.findUnique({ where: { slug: citySlug } }),
  ])

  if (!category) return NextResponse.json({ error: "Invalid category" }, { status: 400 })
  if (!city) return NextResponse.json({ error: "Invalid city" }, { status: 400 })

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
      experienceMin: parseInt(experienceMin) || 0,
      pincode: pincode?.trim() || null,
      qualificationRequired: qualificationRequired ?? null,
      status: "PENDING_REVIEW",
    },
  })

  return NextResponse.json({ success: true, jobId: job.id })
}
