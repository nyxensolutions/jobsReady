import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { sendEmployerWeeklySummary } from "@/lib/email"
import { notifyEmployer, MSG } from "@/lib/sms"

/**
 * Weekly summary cron — runs every Monday at 9 AM IST.
 * For each employer with an ACTIVE subscription, sends a summary of
 * their active jobs and applications received in the last 7 days.
 * Vercel calls this via vercel.json schedule "0 9 * * 1".
 */
export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret") ?? req.nextUrl.searchParams.get("secret")
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // last 7 days

  // Employers with active subscriptions
  const activeSubs = await prisma.subscription.findMany({
    where: {
      status: "ACTIVE",
      expiresAt: { gt: new Date() },
    },
    include: {
      plan: true,
      employer: {
        include: {
          user: true,
          jobListings: {
            where: { status: "ACTIVE" },
            select: {
              id: true,
              title: true,
              _count: { select: { applications: true } },
              applications: {
                where: { createdAt: { gte: since } },
                select: { id: true, status: true },
              },
            },
          },
        },
      },
    },
  })

  let sent = 0

  await Promise.allSettled(
    activeSubs.map(async sub => {
      const employer = sub.employer
      if (!employer.user.email && !employer.contactPhone && !employer.user.phone) return

      const activeJobs = employer.jobListings.length
      const newApplications = employer.jobListings.reduce(
        (acc, j) => acc + j.applications.length,
        0
      )
      const totalApplications = employer.jobListings.reduce(
        (acc, j) => acc + j._count.applications,
        0
      )
      const shortlisted = employer.jobListings.reduce(
        (acc, j) => acc + j.applications.filter(a => a.status === "SHORTLISTED").length,
        0
      )
      const daysLeft = Math.max(0, Math.ceil((sub.expiresAt.getTime() - Date.now()) / 86400000))

      await Promise.allSettled([
        employer.user.email
          ? sendEmployerWeeklySummary({
              employerEmail: employer.user.email,
              companyName: employer.companyName,
              contactPerson: employer.contactPerson,
              stats: {
                activeJobs,
                newApplications,
                totalApplications,
                shortlisted,
                planName: sub.plan.name,
                daysLeft,
              },
            })
          : Promise.resolve(),
        notifyEmployer(
          employer.contactPhone ?? employer.user.phone,
          MSG.employer.weeklySummary(activeJobs, newApplications)
        ),
      ])

      sent++
    })
  )

  console.log(`[cron/employer-weekly] Sent summaries to ${sent} employer(s)`)
  return NextResponse.json({ sent })
}
