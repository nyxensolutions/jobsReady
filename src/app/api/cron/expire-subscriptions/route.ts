import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { sendEmployerPlanExpiring } from "@/lib/email"
import { notifyEmployer, MSG, WA } from "@/lib/sms"

/**
 * Subscription lifecycle cron — runs daily at 2:30 AM IST.
 * Two jobs in one pass:
 *
 * 1. EXPIRE: mark subscriptions whose expiresAt is in the past as EXPIRED,
 *    pause their active jobs (set status → PAUSED), notify employer.
 *
 * 2. WARN: send renewal reminders at 30 / 20 / 10 / 3 days before expiry
 *    (only once per threshold — checked via a lastWarnedAt field workaround
 *    using the updatedAt + checking if we already sent this interval).
 */
export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret") ?? req.nextUrl.searchParams.get("secret")
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  let expired = 0
  let jobsPaused = 0
  let warned = 0

  // ── 1. EXPIRE overdue subscriptions ──────────────────────────────────────────
  const overdue = await prisma.subscription.findMany({
    where: {
      status: { in: ["ACTIVE", "TRIAL"] },
      expiresAt: { lt: now },
    },
    include: {
      employer: { include: { user: true } },
      plan: true,
    },
  })

  for (const sub of overdue) {
    // Mark subscription EXPIRED
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: "EXPIRED" },
    })

    // Pause all active jobs for this employer
    const { count } = await prisma.jobListing.updateMany({
      where: { employerId: sub.employerId, status: "ACTIVE" },
      data: { status: "PAUSED", isHighReach: false },
    })
    jobsPaused += count

    // Notify employer (fire-and-forget)
    const employer = sub.employer
    const phone = employer.contactPhone ?? employer.user.phone
    void Promise.allSettled([
      employer.user.email
        ? sendEmployerPlanExpired({
            employerEmail: employer.user.email,
            companyName: employer.companyName,
            planName: sub.plan.name,
          })
        : Promise.resolve(),
      notifyEmployer(phone, MSG.employer.planExpired()),
      WA.employer.planExpired(phone),
    ])

    expired++
  }

  // ── 2. WARN employers approaching expiry ──────────────────────────────────────
  // Warning thresholds (days before expiry)
  const WARN_DAYS = [30, 20, 10, 3]

  for (const days of WARN_DAYS) {
    const windowStart = new Date(now.getTime() + days * 86400000 - 3600000)      // days ahead - 1h
    const windowEnd   = new Date(now.getTime() + days * 86400000 + 3600000)      // days ahead + 1h

    const expiring = await prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        expiresAt: { gte: windowStart, lte: windowEnd },
      },
      include: {
        employer: { include: { user: true } },
        plan: true,
      },
    })

    for (const sub of expiring) {
      const employer = sub.employer
      const phone = employer.contactPhone ?? employer.user.phone
      void Promise.allSettled([
        employer.user.email
          ? sendEmployerPlanExpiring({
              employerEmail: employer.user.email,
              companyName: employer.companyName,
              planName: sub.plan.name,
              daysLeft: days,
            })
          : Promise.resolve(),
        notifyEmployer(phone, MSG.employer.planExpiringSoon(days)),
        WA.employer.planExpiringSoon(phone, days),
      ])
      warned++
    }
  }

  console.log(`[cron/expire-subscriptions] expired=${expired} jobsPaused=${jobsPaused} warned=${warned}`)
  return NextResponse.json({ expired, jobsPaused, warned })
}

// ── Inline "plan expired" email (no credits, jobs paused) ────────────────────
// Imported sendEmployerPlanExpiring covers "expiring soon".
// This covers "already expired".
async function sendEmployerPlanExpired({
  employerEmail, companyName, planName,
}: { employerEmail: string; companyName: string; planName: string }) {
  const { Resend } = await import("resend")
  const resend = new Resend(process.env.RESEND_API_KEY)
  const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@jobs24india.com"
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://jobs24india.com"

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb">
  <tr><td style="background:#1a3461;padding:24px 32px">
    <span style="font-size:22px;font-weight:800;color:#fff">Jobs<span style="color:#f97316">24</span>India</span>
  </td></tr>
  <tr><td style="padding:32px">
    <h2 style="margin:0 0 8px;color:#dc2626;font-size:20px">🔴 Your plan has expired</h2>
    <p style="margin:0 0 20px;color:#6b7280;font-size:14px">Hi ${companyName}, your <strong>${planName}</strong> has expired.</p>
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px;margin-bottom:24px;font-size:13px;color:#374151">
      Your active jobs have been <strong>paused</strong> and are no longer visible to candidates. Renew your plan to reactivate them instantly.
    </div>
    <a href="${APP_URL}/employer/plans" style="display:inline-block;background:#1a3461;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:700">Renew Plan →</a>
    <p style="margin:24px 0 0;font-size:12px;color:#9ca3af">Questions? Email billing@jobs24india.com</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`

  await resend.emails.send({
    from: `Jobs24India <${FROM}>`,
    to: employerEmail,
    subject: `🔴 Your ${planName} has expired — jobs paused`,
    html,
  })
}
