import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { sendEmployerPlanExpiring } from "@/lib/email"
import { sendEmployerPlanExpiringWhatsApp } from "@/lib/whatsapp"
import { notifyEmployer, MSG } from "@/lib/sms"
import { SITE_URL } from "@/lib/seo"

/**
 * Subscription lifecycle cron. Called by .github/workflows/cron.yml on
 * "30 19 * * *" — 01:00 IST, the following day in IST terms.
 *
 * Two jobs in one pass:
 *
 * 1. EXPIRE: mark subscriptions whose expiresAt is in the past as EXPIRED,
 *    pause their active jobs (set status → PAUSED), notify employer.
 *
 * 2. WARN: send renewal reminders at 30 / 20 / 10 / 3 days before expiry.
 *    Each threshold is one IST calendar day wide, so a once-a-day run sends
 *    each reminder exactly once. There is no per-subscription send log — the
 *    schedule is the dedupe — so running this route twice in an IST day sends
 *    the same reminder twice.
 */

const IST_OFFSET_MS = 5.5 * 3600_000

/**
 * Start of the IST calendar day containing `t`, as a UTC instant.
 *
 * Done by shifting into IST, truncating, and shifting back rather than with a
 * timezone library: the only zone this product schedules in is IST, and the
 * offset has no DST to account for.
 */
function startOfIstDay(t: Date): Date {
  const ist = new Date(t.getTime() + IST_OFFSET_MS)
  ist.setUTCHours(0, 0, 0, 0)
  return new Date(ist.getTime() - IST_OFFSET_MS)
}
/** Mail and SMS fan-out: the default function timeout is not enough. */
export const maxDuration = 60

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
    ])

    expired++
  }

  // ── 2. WARN employers approaching expiry ──────────────────────────────────────
  // Warning thresholds (days before expiry)
  const WARN_DAYS = [30, 20, 10, 3]

  /**
   * Each threshold matches a whole IST calendar day, not an instant.
   *
   * This used to be a ±1 hour window centred on `now + N days`. That is correct
   * for an hourly job, but this one runs once a day at 19:30 UTC, so 22 of every
   * 24 hours were never covered. `expiresAt` is set at purchase as
   * `now + plan.durationDays`, so it inherits the purchase time of day — meaning
   * only employers who happened to buy between roughly 18:30 and 20:30 UTC ever
   * got a renewal reminder, and everyone else went from silence straight to an
   * expiry notice. Nothing surfaced the misses: `warned` counted the sends it
   * made, not the subscriptions it skipped.
   *
   * A day-wide window still fires exactly once per threshold **because the cron
   * runs once a day**. Running this route twice in one IST day double-warns, so
   * `workflow_dispatch` reruns of `expire-subscriptions` are not free — there is
   * no per-subscription send log to fall back on.
   */
  for (const days of WARN_DAYS) {
    const windowStart = startOfIstDay(new Date(now.getTime() + days * 86400000))
    const windowEnd   = new Date(windowStart.getTime() + 86400000)

    const expiring = await prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        // `lt` on the end, so a subscription on the boundary cannot be caught
        // by two adjacent thresholds.
        expiresAt: { gte: windowStart, lt: windowEnd },
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
        // MARKETING per Meta, so consent-gated — a renewal prompt is a
        // prompt to come back and act, whatever the wording. The template
        // cannot pluralise, so {{3}} carries the whole phrase.
        phone
          ? sendEmployerPlanExpiringWhatsApp(
              phone,
              employer.user.whatsappOptIn,
              employer.contactPerson ?? employer.companyName,
              sub.plan.name,
              `${days} ${days === 1 ? "day" : "days"}`
            )
          : Promise.resolve(),
        notifyEmployer(phone, MSG.employer.planExpiringSoon(days)),
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
  const APP_URL = SITE_URL

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
