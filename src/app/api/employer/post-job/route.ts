import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import { salaryRangeError } from "@/lib/salary"
import { isAreaInCity } from "@/lib/areas"
import { checkPostJobLimit, getPlanLimits } from "@/lib/subscription"

export async function POST(req: NextRequest) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

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
    area,
    languagesRequired,
    callToHrEnabled,
    callToHrPhone,
    incentives,
    workingDaysPerWeek,
    shiftType,
    expiresAt,
  } = body

  if (!title || !categorySlug || !citySlug || !jobType || !description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const salaryError = salaryRangeError(salaryMin, salaryMax)
  if (salaryError) return NextResponse.json({ error: salaryError }, { status: 400 })


  const dbUser = await prisma.user.findUnique({ where: { id: session.uid } })
  if (!dbUser || dbUser.role !== "EMPLOYER") {
    return NextResponse.json({ error: "Only employers can post jobs" }, { status: 403 })
  }

  const employer = await prisma.employerProfile.findUnique({ where: { userId: session.uid } })
  if (!employer) {
    return NextResponse.json({ error: "Complete employer registration first" }, { status: 403 })
  }

  // ── Plan guard: active job limit ───────────────────────────────
  const limitError = await checkPostJobLimit(employer.id)
  if (limitError) {
    return NextResponse.json({ error: limitError, code: "UPGRADE_REQUIRED", message: limitError }, { status: 402 })
  }

  const [category, city] = await Promise.all([
    prisma.category.findUnique({ where: { slug: categorySlug } }),
    prisma.city.findUnique({ where: { slug: citySlug } }),
  ])

  if (!category) return NextResponse.json({ error: "Invalid category" }, { status: 400 })
  if (!city) return NextResponse.json({ error: "Invalid city" }, { status: 400 })
  /**
   * An area is optional, but a wrong one is worse than none: it sends a seeker
   * across the city for a job that is not there. "okhla" on a Hyderabad
   * listing is a caller bug, so it is refused rather than stored.
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
      pincode: pincode?.trim() || null,
      area: areaSlug,
      qualificationRequired: qualificationRequired ?? null,
      languagesRequired: Array.isArray(languagesRequired) ? languagesRequired.filter(Boolean) : [],
      status: "PENDING_REVIEW",
      isHighReach: (await getPlanLimits(employer.id)).isHighReach,
      incentives: incentives?.trim() || null,
      workingDaysPerWeek: workingDaysPerWeek ? parseInt(workingDaysPerWeek) : null,
      shiftType: shiftType?.trim() || null,
      callToHrEnabled: callToHrEnabled === true,
      callToHrPhone: callToHrEnabled === true ? (callToHrPhone?.trim() || null) : null,
      // Optional; null means the listing runs until the employer closes it.
      // save-draft already accepted this, and the mobile app posts here.
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  })

  return NextResponse.json({ success: true, jobId: job.id })
}
