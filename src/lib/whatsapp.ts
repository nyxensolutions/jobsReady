/**
 * Gupshup WhatsApp Business API integration
 * Phone: +91 88009 29721 | WABA ID: 1603050564877428
 *
 * Two message types:
 *  - Template messages: pre-approved by Meta, used for business-initiated alerts
 *  - Text messages: only within 24h session after user replies (free-form)
 *
 * All outbound notification functions use templates.
 * Template IDs must match what you create + get approved in Gupshup dashboard.
 */

const GUPSHUP_API = "https://api.gupshup.io/sm/api/v1/msg"
const API_KEY     = process.env.GUPSHUP_API_KEY
const SOURCE      = process.env.GUPSHUP_PHONE ?? "918800929721" // no + prefix

// ── Core sender ───────────────────────────────────────────────────────────────

function normalizePhone(phone: string): string {
  // Accepts: 9876543210, +919876543210, 919876543210
  const digits = phone.replace(/\D/g, "")
  if (digits.startsWith("91") && digits.length === 12) return digits
  if (digits.length === 10) return `91${digits}`
  return digits
}

async function sendMessage(to: string, message: object): Promise<void> {
  if (!API_KEY) {
    console.warn("[WhatsApp] GUPSHUP_API_KEY not set — skipping")
    return
  }

  const params = new URLSearchParams({
    channel:    "whatsapp",
    source:     SOURCE,
    destination: normalizePhone(to),
    message:    JSON.stringify(message),
    "src.name": "Jobs24India",
  })

  try {
    const res = await fetch(GUPSHUP_API, {
      method:  "POST",
      headers: {
        apikey:         API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    })
    if (!res.ok) {
      const text = await res.text()
      console.error("[WhatsApp] Gupshup error:", res.status, text)
    }
  } catch (err) {
    console.error("[WhatsApp] Network error:", err)
  }
}

// ── Low-level helpers ─────────────────────────────────────────────────────────

/** Send a free-form text (only valid within 24h after user messages you) */
export async function sendWhatsAppText(phone: string, text: string) {
  return sendMessage(phone, { type: "text", text })
}

/**
 * Send an approved template message.
 * templateId = the template name as approved in Gupshup / Meta.
 * params = ordered list of {{1}}, {{2}} … values.
 */
export async function sendWhatsAppTemplate(
  phone: string,
  templateId: string,
  params: string[]
) {
  return sendMessage(phone, {
    type: "template",
    template: { id: templateId, params },
  })
}

// ── Notification helpers ──────────────────────────────────────────────────────
// Template names below must be created in Gupshup dashboard → Templates
// and approved by Meta before they work in production.
// Use exact same variable count as the template body.

/** Seeker: welcome message on signup (phone-only users) */
export async function sendSeekerWelcomeWhatsApp(phone: string, name: string) {
  // Template body example:
  // "Hi {{1}}! Welcome to Jobs24India 🎉
  //  Browse thousands of jobs near you and apply in one tap.
  //  Visit: https://jobs24india.com"
  return sendWhatsAppTemplate(phone, "seeker_welcome_v1", [name])
}

/** Seeker: job alert matching their profile */
export async function sendSeekerJobAlertWhatsApp(
  phone: string,
  name: string,
  jobTitle: string,
  city: string,
  salary: string,
  jobId: string
) {
  // Template body:
  // "Hi {{1}}, new job for you!
  //  🏢 {{2}} in {{3}}
  //  💰 {{4}}
  //  Apply now: https://jobs24india.com/jobs/{{5}}"
  return sendWhatsAppTemplate(phone, "seeker_job_alert_v1", [
    name, jobTitle, city, salary, jobId,
  ])
}

/** Seeker: application submitted confirmation */
export async function sendSeekerApplicationWhatsApp(
  phone: string,
  name: string,
  jobTitle: string,
  companyName: string
) {
  // Template body:
  // "Hi {{1}}, your application for *{{2}}* at {{3}} has been submitted ✅
  //  We'll notify you when the employer responds."
  return sendWhatsAppTemplate(phone, "seeker_application_confirm_v1", [
    name, jobTitle, companyName,
  ])
}

/** Seeker: shortlisted by employer */
export async function sendSeekerShortlistedWhatsApp(
  phone: string,
  name: string,
  jobTitle: string,
  companyName: string
) {
  // Template body:
  // "🎉 Hi {{1}}, great news! You've been shortlisted for *{{2}}* at {{3}}.
  //  Keep your phone handy — the employer may call soon."
  return sendWhatsAppTemplate(phone, "seeker_shortlisted_v1", [
    name, jobTitle, companyName,
  ])
}

/** Seeker: application viewed by employer */
export async function sendSeekerViewedWhatsApp(
  phone: string,
  name: string,
  jobTitle: string,
  companyName: string
) {
  // Template body:
  // "Hi {{1}}, {{3}} viewed your application for *{{2}}*.
  //  Stay ready — they may reach out soon! jobs24india.com"
  return sendWhatsAppTemplate(phone, "seeker_viewed_v1", [
    name, jobTitle, companyName,
  ])
}

/** Seeker: hired */
export async function sendSeekerHiredWhatsApp(
  phone: string,
  name: string,
  jobTitle: string,
  companyName: string
) {
  // Template body:
  // "🏆 Congratulations {{1}}! {{3}} has selected you for *{{2}}*.
  //  Login to Jobs24India for next steps. jobs24india.com"
  return sendWhatsAppTemplate(phone, "seeker_hired_v1", [
    name, jobTitle, companyName,
  ])
}

/** Seeker: application rejected */
export async function sendSeekerRejectedWhatsApp(
  phone: string,
  name: string,
  jobTitle: string
) {
  // Template body:
  // "Hi {{1}}, your application for *{{2}}* was not selected this time.
  //  Don't give up — keep applying! jobs24india.com"
  return sendWhatsAppTemplate(phone, "seeker_rejected_v1", [
    name, jobTitle,
  ])
}

/** Employer: welcome message on registration (phone-only) */
export async function sendEmployerWelcomeWhatsApp(
  phone: string,
  companyName: string
) {
  // Template body:
  // "Welcome to Jobs24India! 👋
  //  Hi {{1}}, your employer account is ready.
  //  Post your first job at: https://jobs24india.com/employer/post-job"
  return sendWhatsAppTemplate(phone, "employer_welcome_v1", [companyName])
}

/** Employer: new application received */
export async function sendEmployerApplicationWhatsApp(
  phone: string,
  employerName: string,
  seekerName: string,
  jobTitle: string
) {
  // Template body:
  // "Hi {{1}}, *{{2}}* applied for your job *{{3}}*.
  //  View application: https://jobs24india.com/employer/dashboard"
  return sendWhatsAppTemplate(phone, "employer_new_application_v1", [
    employerName, seekerName, jobTitle,
  ])
}

/** Employer: account verified / onboarding complete */
export async function sendEmployerOnboardingWhatsApp(
  phone: string,
  companyName: string
) {
  // Template body:
  // "🎉 {{1}} is now verified on Jobs24India!
  //  You can now post jobs and start receiving applications.
  //  Dashboard: https://jobs24india.com/employer/dashboard"
  return sendWhatsAppTemplate(phone, "employer_onboarding_complete_v1", [
    companyName,
  ])
}
