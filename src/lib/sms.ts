/**
 * Notification SMS via 2Factor.in.
 *
 *   TWOFACTOR_API_KEY=your_key      (from the 2factor.in dashboard)
 *   TWOFACTOR_SENDER_ID=JBSRDY      (DLT-registered header, 6 chars)
 *
 * **India's DLT rules do not allow free-text transactional SMS.** Every
 * message must be sent as a registered content template: `TemplateName` plus
 * `VAR1..VARn`, not `Msg`. The account currently has exactly one approved
 * template (`JOBRDYOTP`, an OTP template), so none of the MSG bodies below can
 * be delivered yet — each needs registering on the DLT portal and in 2Factor
 * first. `send()` reports that rather than hiding it.
 *
 * Login OTP does NOT come from here; it is sent by Firebase Authentication.
 * See scripts/test-sms.ts to check balance and send a test message.
 */

const TF_API_KEY   = process.env.TWOFACTOR_API_KEY  ?? ""
const TF_SENDER_ID = process.env.TWOFACTOR_SENDER_ID ?? "JBSRDY"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function cleanPhone(phone: string): string {
  return phone.replace(/^\+91/, "").replace(/\D/g, "").slice(-10)
}

// ─── SMS via 2Factor.in ───────────────────────────────────────────────────────

export type SmsResult =
  | { ok: true; id: string }
  | { ok: false; error: string }

/**
 * Sends one transactional SMS and reports what happened.
 *
 * Returns a result rather than throwing, so a failed notification never fails
 * the request that triggered it — but callers (and the logs) can tell the
 * difference between sent and silently dropped. The previous version returned
 * `void` whether it worked or not, which is how this channel stayed broken
 * without anyone noticing.
 */
export async function sendSms(
  phone: string | null | undefined,
  message: string
): Promise<SmsResult> {
  if (!TF_API_KEY) {
    console.warn("[sms] TWOFACTOR_API_KEY not set — skipping SMS")
    return { ok: false, error: "NO_API_KEY" }
  }
  if (!phone) return { ok: false, error: "NO_PHONE" }

  const clean = cleanPhone(phone)
  if (clean.length !== 10) {
    console.warn("[sms] invalid phone, skipping:", phone)
    return { ok: false, error: "INVALID_PHONE" }
  }

  try {
    // POST with a JSON body — this endpoint ignores query parameters, and a
    // GET produced "Missing 'To' parameter value" no matter what was in the
    // URL. That is why this channel never delivered anything.
    const res = await fetch(
      `https://2factor.in/API/V1/${TF_API_KEY}/ADDON_SERVICES/SEND/TSMS`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ From: TF_SENDER_ID, To: clean, Msg: message }),
      }
    )
    const data = (await res.json().catch(() => null)) as
      | { Status?: string; Details?: string }
      | null

    if (data?.Status === "Success") {
      return { ok: true, id: String(data.Details ?? "") }
    }

    // Details carries the reason, e.g. "Missing templatename value" when DLT
    // rejects a free-text body. Log it — it is the only signal this channel has.
    const error = data?.Details ?? `HTTP ${res.status}`
    console.error(`[sms] 2Factor refused (${clean}): ${error}`)
    return { ok: false, error }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    console.error(`[sms] send failed (${clean}): ${error}`)
    return { ok: false, error }
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
