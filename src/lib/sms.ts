/**
 * Notifications — SMS via 2Factor.in, WhatsApp via Interakt.
 *
 * ── SMS (already working) ────────────────────────────────────────────────────
 *   TWOFACTOR_API_KEY=your_key          (from 2factor.in dashboard)
 *   TWOFACTOR_SENDER_ID=JBSRDY         (DLT-registered sender ID)
 *
 * ── WhatsApp via Interakt ────────────────────────────────────────────────────
 *   Add your WhatsApp Business number, complete Meta verification (~1-2 days)
 *   Register the templates listed in docs/whatsapp-templates.md
 *   Then add to .env.local:
 *
 * SMS continues to work independently.
 */

const TF_API_KEY   = process.env.TWOFACTOR_API_KEY  ?? ""
const TF_SENDER_ID = process.env.TWOFACTOR_SENDER_ID ?? "JBSRDY"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cleanPhone(phone: string): string {
  return phone.replace(/^\+91/, "").replace(/\D/g, "").slice(-10)
}

// ─── SMS via 2Factor.in ───────────────────────────────────────────────────────

export async function sendSms(phone: string | null | undefined, message: string): Promise<void> {
  if (!TF_API_KEY) {
    console.warn("[sms] TWOFACTOR_API_KEY not set — skipping SMS")
    return
  }
  if (!phone) return

  const clean = cleanPhone(phone)
  if (clean.length !== 10) {
    console.warn("[sms] Invalid phone, skipping:", phone)
    return
  }

  try {
    const url =
      `https://2factor.in/API/V1/${TF_API_KEY}/ADDON_SERVICES/SEND/TSMS` +
      `?From=${encodeURIComponent(TF_SENDER_ID)}` +
      `&To=${clean}` +
      `&Msg=${encodeURIComponent(message)}`

    const res  = await fetch(url)
    const data = await res.json().catch(() => null)

    if (data?.Status !== "Success") {
      console.error("[sms] 2Factor error:", data)
    }
  } catch (err) {
    console.error("[sms] send failed:", err)
  }
}

// ─── WhatsApp via Interakt ────────────────────────────────────────────────────
// Template names must match exactly what you registered in the Interakt dashboard.
// Use the "Utility" category for all of these (faster Meta approval).
// All templates use {{1}}, {{2}} … placeholders in body.



// ─── Convenience helpers ──────────────────────────────────────────────────────

export async function notifySeeker(phone: string | null | undefined, message: string) {
  if (!phone) return
  await Promise.allSettled([
    sendSms(phone, message),
    // WA is sent via typed helpers below; this SMS-only helper is kept for
    // places that don't have template params (e.g. cron digest)
  ])
}

export async function notifyEmployer(phone: string | null | undefined, message: string) {
  if (!phone) return
  await Promise.allSettled([sendSms(phone, message)])
}

// ─── Typed WhatsApp senders (use template params, not free-form text) ─────────

// WhatsApp for the plan lifecycle (activated / expiring / expired) was wired
// to Interakt with j24_* templates. That provider is gone and those templates
// never existed on the Meta WABA, so the calls were silent no-ops and have been
// removed; the SMS alongside each one still fires. When billing goes live,
// create the templates on the WABA and send them via src/lib/whatsapp.ts.


// ─── SMS message templates (DLT-registered, ≤160 chars) ──────────────────────

export const MSG = {
  seeker: {
    applied: (title: string, company: string) =>
      `Jobs24India: Your application for ${title} at ${company} was submitted. Track it at jobs24india.com`,

    viewed: (title: string, company: string) =>
      `Jobs24India: ${company} viewed your application for ${title}. Stay ready! jobs24india.com`,

    shortlisted: (title: string, company: string) =>
      `Jobs24India: Great news! ${company} shortlisted you for ${title}. Login to check. jobs24india.com`,

    hired: (title: string, company: string) =>
      `Jobs24India: Congratulations! ${company} selected you for ${title}. Login for details. jobs24india.com`,

    rejected: (title: string) =>
      `Jobs24India: Your application for ${title} was not selected. Keep applying! jobs24india.com`,

    newJobs: (count: number) =>
      `Jobs24India: ${count} new job${count > 1 ? "s" : ""} match your skills today. Apply now at jobs24india.com`,

    profileIncomplete: () =>
      `Jobs24India: Complete your profile (name, skills, city, resume) to get more calls. jobs24india.com/seeker/profile`,
  },

  employer: {
    newApplication: (title: string, name: string) =>
      `Jobs24India: New application for ${title} from ${name}. Review at jobs24india.com/employer/dashboard`,

    planActivated: (plan: string, days: number) =>
      `Jobs24India: Your ${plan} is active for ${days} days. Start hiring at jobs24india.com/employer/dashboard`,

    planExpiringSoon: (days: number) =>
      `Jobs24India: Your plan expires in ${days} day${days > 1 ? "s" : ""}. Renew now. jobs24india.com/employer/plans`,

    planExpired: () =>
      `Jobs24India: Your plan has expired. Jobs are paused. Renew now at jobs24india.com/employer/plans`,

    weeklySummary: (jobs: number, applications: number) =>
      `Jobs24India Weekly: ${jobs} active job${jobs > 1 ? "s" : ""}, ${applications} new application${applications > 1 ? "s" : ""} this week. jobs24india.com`,
  },
}
