import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { sendSeekerJobDigest } from "@/lib/email"
import { notifySeeker, MSG } from "@/lib/sms"

/**
 * Daily digest cron — runs every morning at 8 AM IST.
 * Finds seekers with preferredCategories, matches against active jobs
 * posted in the last 48 hours, and sends email + SMS.
 * Vercel calls this via vercel.json schedule "0 8 * * *".
 */
export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret") ?? req.nextUrl.searchParams.get("secret")
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const since = new Date(Date.now() - 48 * 60 * 60 * 1000) // last 48 hours

  // Fetch seekers with at least one preferred category
  const seekers = await prisma.seekerProfile.findMany({
    where: {
      preferredCategories: { isEmpty: false },
      isOpenToWork: true,
    },
    include: { user: true },
  })

  let notified = 0

  await Promise.allSettled(
    seekers.map(async seeker => {
      if (!seeker.user.email && !seeker.user.phone) return

      const categorySlugs: string[] = seeker.preferredCategories ?? []
      const preferredCities: string[] = seeker.preferredCities ?? []

      if (categorySlugs.length === 0) return

      // Build OR: match preferred categories OR preferred cities
      const cityFilter = preferredCities.length > 0
        ? [{ city: { slug: { in: preferredCities } } }]
        : []

      const jobs = await prisma.jobListing.findMany({
        where: {
          status: "ACTIVE",
          createdAt: { gte: since },
          OR: [
            { category: { slug: { in: categorySlugs } } },
            ...cityFilter,
          ],
        },
        include: {
          employer: { select: { companyName: true } },
          city: { select: { name: true } },
        },
        take: 8,
        orderBy: { createdAt: "desc" },
      })

      if (jobs.length === 0) return

      const jobRows = jobs.map(j => ({
        title: j.title,
        companyName: j.employer.companyName,
        city: j.city.name,
        salaryMin: j.salaryMin ?? null,
        salaryMax: j.salaryMax ?? null,
        id: j.id,
      }))

      const seekerName = seeker.name ?? "Job Seeker"

      await Promise.allSettled([
        seeker.user.email
          ? sendSeekerJobDigest({
              seekerEmail: seeker.user.email,
              seekerName,
              jobs: jobRows,
            })
          : Promise.resolve(),
        notifySeeker(seeker.user.phone, MSG.seeker.newJobs(jobs.length)),
      ])

      notified++
    })
  )

  console.log(`[cron/seeker-digest] Notified ${notified} seeker(s) with new matching jobs`)
  return NextResponse.json({ notified })
}
