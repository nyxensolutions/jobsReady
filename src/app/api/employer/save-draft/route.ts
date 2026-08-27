import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import { checkPostJobLimit, getPlanLimits } from "@/lib/subscription"
import { JobType } from "@prisma/client"

export async function POST(req: NextRequest) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const employer = await prisma.employerProfile.findUnique({ where: { userId: session.uid } })
  if (!employer) return NextResponse.json({ error: "Employer profile required" }, { status: 403 })

  const body = await req.json()
  const {
    draftId,
    submit,        // if true → publish draft as PENDING_REVIEW
    title,
    categorySlug,
    citySlug,
    jobType,
    vacancies,
    salaryMin,
    salaryMax,
    salaryUnit,
    requirements,
    perks,
    pincode,
    languagesRequired,
    experienceMin,
    qualificationRequired,
    description,
    incentives,
    workingDaysPerWeek,
    shiftType,
    callToHrEnabled,
    callToHrPhone,
  } = body

  if (!title?.trim() || !categorySlug || !citySlug) {
    return NextResponse.json({ error: "Title, category and city are required to save a draft" }, { status: 400 })
  }

  const [category, city] = await Promise.all([
    prisma.category.findUnique({ where: { slug: categorySlug } }),
    prisma.city.findUnique({ where: { slug: citySlug } }),
  ])
  if (!category) return NextResponse.json({ error: "Invalid category" }, { status: 400 })
  if (!city) return NextResponse.json({ error: "Invalid city" }, { status: 400 })

  // Only check plan limit when actually submitting for review
  if (submit) {
    const limitError = await checkPostJobLimit(employer.id)
    if (limitError) {
      return NextResponse.json({ error: "UPGRADE_REQUIRED", message: limitError }, { status: 402 })
    }
  }

  const isHighReach = submit ? (await getPlanLimits(employer.id)).isHighReach : undefined

  const data = {
    title: title.trim(),
    categoryId: category.id,
    cityId: city.id,
    jobType: (jobType as JobType) ?? "FULL_TIME",
    vacancies: parseInt(vacancies) || 1,
    salaryMin: salaryMin ? parseInt(salaryMin) : null,
    salaryMax: salaryMax ? parseInt(salaryMax) : null,
    salaryUnit: salaryUnit ?? "monthly",
    requirements: Array.isArray(requirements) ? requirements.filter(Boolean) : [],
    perks: Array.isArray(perks) ? perks.filter(Boolean) : [],
    pincode: pincode?.trim() || null,
    languagesRequired: Array.isArray(languagesRequired) ? languagesRequired.filter(Boolean) : [],
    experienceMin: parseFloat(experienceMin) || 0,
    qualificationRequired: qualificationRequired ?? null,
    description: description?.trim() || "",
    incentives: incentives?.trim() || null,
    workingDaysPerWeek: workingDaysPerWeek ? parseInt(workingDaysPerWeek) : null,
    shiftType: shiftType?.trim() || null,
    callToHrEnabled: callToHrEnabled === true,
    callToHrPhone: callToHrEnabled === true ? (callToHrPhone?.trim() || null) : null,
    status: submit ? ("PENDING_REVIEW" as const) : ("DRAFT" as const),
    ...(submit ? { publishedAt: null, isHighReach: isHighReach ?? false } : {}),
  }

  let job
  if (draftId) {
    // Verify this draft belongs to this employer
    const existing = await prisma.jobListing.findFirst({
      where: { id: draftId, employerId: employer.id, status: "DRAFT" },
    })
    if (!existing) return NextResponse.json({ error: "Draft not found" }, { status: 404 })

    job = await prisma.jobListing.update({ where: { id: draftId }, data })
  } else {
    job = await prisma.jobListing.create({
      data: { ...data, employerId: employer.id },
    })
  }

  return NextResponse.json({ success: true, draftId: job.id })
}
