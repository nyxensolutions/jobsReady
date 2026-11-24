import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { sendEmployerJobApprovedAlert, sendEmployerJobRejectedAlert } from "@/lib/email"
import { sendEmployerJobApprovedWhatsApp } from "@/lib/whatsapp"
import { sendPushToUser } from "@/lib/push"
import { assertAdmin } from "@/lib/admin"
import { isAreaInCity } from "@/lib/areas"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!await assertAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const { action, reason, enabled, phone } = body as {
    action: string; reason?: string; enabled?: boolean; phone?: string
  }
  let data: any = {}

  if (action === "approve") {
    data = { status: "ACTIVE", publishedAt: new Date(), expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
  } else if (action === "reject") {
    data = { status: "REJECTED" }
  } else if (action === "deactivate") {
    data = { status: "CLOSED" }
  } else if (action === "reactivate") {
    data = { status: "PENDING_REVIEW" }
  } else if (action === "feature") {
    const job = await prisma.jobListing.findUnique({ where: { id } })
    data = { isFeatured: !job?.isFeatured }
  } else if (action === "set-call-hr") {
    const existing = await prisma.jobListing.findUnique({ where: { id }, select: { callToHrEnabled: true, callToHrPhone: true } })
    data = {
      callToHrEnabled: enabled ?? !existing?.callToHrEnabled,
      callToHrPhone: phone !== undefined ? (phone || null) : existing?.callToHrPhone,
    }
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  }

  const job = await prisma.jobListing.update({
    where: { id },
    data,
    include: {
      employer: { select: { userId: true, companyName: true, contactPerson: true, contactPhone: true } },
    },
  })

  // Notify employer on approve or reject
  if (action === "approve" || action === "reject") {
    const employerUserId = job.employer.userId

    // In-app notification
    const notifTitle = action === "approve"
      ? `Your job "${job.title}" is now live!`
      : `Your job "${job.title}" needs changes`
    const notifBody = action === "approve"
      ? "Congratulations! Your job has been approved and is visible to candidates."
      : `Your job posting was not approved. ${reason ? `Reason: ${reason}` : "Please edit and resubmit."}`

    await prisma.notification.create({
      data: {
        userId: employerUserId,
        type: action === "approve" ? "JOB_APPROVED" : "JOB_REJECTED",
        title: notifTitle,
        body: notifBody,
        data: { jobId: id, jobTitle: job.title },
      },
    })

    sendPushToUser(employerUserId, {
      title: notifTitle,
      body: notifBody,
      data: { jobId: id, type: action === "approve" ? "JOB_APPROVED" : "JOB_REJECTED" }
    })

    // Email — fire and forget, use email stored in DB
    ;(async () => {
      try {
        const empUser = await prisma.user.findUnique({
          where: { id: employerUserId },
          select: { email: true, phone: true },
        })

        // Only the approval has an approved template so far;
        // employer_job_rejected_v1 is still in review with Meta.
        const empPhone = job.employer.contactPhone ?? empUser?.phone
        if (action === "approve" && empPhone) {
          await sendEmployerJobApprovedWhatsApp(
            empPhone,
            job.employer.contactPerson ?? job.employer.companyName,
            job.title
          )
        }

        if (empUser?.email) {
          if (action === "approve") {
            await sendEmployerJobApprovedAlert({
              employerEmail: empUser.email,
              employerName: job.employer.contactPerson ?? job.employer.companyName,
              jobTitle: job.title,
              jobId: id,
            })
          } else {
            await sendEmployerJobRejectedAlert({
              employerEmail: empUser.email,
              employerName: job.employer.contactPerson ?? job.employer.companyName,
              jobTitle: job.title,
              reason,
            })
          }
        }
      } catch (err) {
        console.error("Employer job status email failed:", err)
      }
    })()
  }

  return NextResponse.json(job)
}

// Full admin edit — does NOT reset status to PENDING_REVIEW
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!await assertAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const {
    title, categorySlug, citySlug, jobType, area,
    salaryMin, salaryMax, salaryUnit,
    vacancies, experienceMin, qualificationRequired,
    description, requirements, perks, pincode,
    incentives, workingDaysPerWeek, shiftType,
    callToHrEnabled, callToHrPhone,
    status,
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

  let areaSlug: string | null = null
  if (typeof area === "string" && area.trim()) {
    areaSlug = area.trim()
    if (!isAreaInCity(areaSlug, city.slug)) {
      return NextResponse.json({ error: `"${areaSlug}" is not a valid area in ${city.name}.` }, { status: 400 })
    }
  }

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
      qualificationRequired: qualificationRequired || null,
      description: description.trim(),
      requirements: Array.isArray(requirements) ? requirements.filter(Boolean) : [],
      perks: Array.isArray(perks) ? perks.filter(Boolean) : [],
      pincode: pincode?.trim() || null,
      area: areaSlug,
      incentives: incentives?.trim() || null,
      workingDaysPerWeek: workingDaysPerWeek ? parseInt(workingDaysPerWeek) : null,
      shiftType: shiftType || null,
      callToHrEnabled: !!callToHrEnabled,
      callToHrPhone: callToHrPhone?.trim() || null,
      ...(status && { status }),
    },
  })

  return NextResponse.json({ success: true, job: updated })
}
