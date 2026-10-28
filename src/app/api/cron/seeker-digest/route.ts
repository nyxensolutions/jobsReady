import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { sendSeekerJobDigest } from "@/lib/email"
import { notifySeeker, MSG } from "@/lib/sms"

/**
 * Daily digest cron — invoked from /api/cron/daily at 08:00 IST.
 *
 * Matches active jobs posted in the last 48 hours against whatever interest
 * signal a seeker has, in order: their stated preferred categories, failing
 * that the categories of jobs they have already applied to, failing that the
 * city on their profile.
 *
 * The fallbacks exist because **no profile form writes preferredCategories**
 * — every seeker has an empty array, so the original query matched nobody and
 * this digest had never sent a single message. Collecting the field properly
 * is the real fix; it also makes employer Talent Search work, which filters
 * candidates on the same column.
 */
export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret") ?? req.nextUrl.searchParams.get("secret")
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const since = new Date(Date.now() - 48 * 60 * 60 * 1000) // last 48 hours

  const seekers = await prisma.seekerProfile.findMany({
    where: { isOpenToWork: true },
    include: {
      user: true,
      // Revealed preference, for the majority who have stated none.
      applications: {
        select: { job: { select: { category: { select: { slug: true } } } } },
        take: 20,
        orderBy: { createdAt: "desc" },
      },
    },
  })

  let notified = 0

  await Promise.allSettled(
    seekers.map(async seeker => {
      if (!seeker.user.email && !seeker.user.phone) return

      const stated: string[] = seeker.preferredCategories ?? []
      const applied = [
        ...new Set(
          seeker.applications
            .map(a => a.job.category?.slug)
            .filter((s): s is string => !!s)
        ),
      ]
      const categorySlugs = stated.length > 0 ? stated : applied
      const preferredCities: string[] = seeker.preferredCities ?? []

      const cityNames = preferredCities.length > 0 ? [] : seeker.city ? [seeker.city] : []

      // No category and no city means no way to pick jobs they would want.
      // Sending them everything would be noise, so skip rather than spam.
      if (categorySlugs.length === 0 && preferredCities.length === 0 && cityNames.length === 0) return

      const match = [
        ...(categorySlugs.length > 0 ? [{ category: { slug: { in: categorySlugs } } }] : []),
        ...(preferredCities.length > 0 ? [{ city: { slug: { in: preferredCities } } }] : []),
        ...(cityNames.length > 0 ? [{ city: { name: { in: cityNames } } }] : []),
      ]

      const jobs = await prisma.jobListing.findMany({
        where: {
          status: "ACTIVE",
          createdAt: { gte: since },
          OR: match,
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
