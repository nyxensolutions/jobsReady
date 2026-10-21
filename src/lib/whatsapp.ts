/**
 * WhatsApp Business Platform — Meta Cloud API
 * Phone: +91 88009 29721 | WABA ID: 1603050564877428
 *
 * Replaces the earlier Gupshup BSP transport, whose API key stopped being
 * recognised ("Portal User Not Found With APIKey"). The exported helpers keep
 * their old signatures, so call sites did not change.
 *
 * Two message types:
 *  - Template messages: pre-approved by Meta, used for business-initiated alerts
 *  - Text messages: only within 24h session after user replies (free-form)
 *
 * Template names below must match what is approved on the WABA, and the
 * parameter count must match the template body exactly or Meta rejects the
 * send with error 132000.
 */

const API_VERSION = process.env.WHATSAPP_API_VERSION ?? "v25.0"
const TOKEN = process.env.WHATSAPP_TOKEN
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID
/** Fallback language for templates not listed in TEMPLATE_LANG below. */
const LANG = process.env.WHATSAPP_TEMPLATE_LANG ?? "en"

/**
 * Per-template language overrides.
 *
 * Templates are approved per-language, and the send must name the exact
 * locale it was approved under or Meta returns 132001 — the same error as a
 * missing template, which makes it easy to misdiagnose. Most of this WABA is
 * "en"; seeker_application_confirm_v3 was approved as "en_GB".
 *
 * Verify against the live list with:
 *   npx tsx scripts/test-whatsapp.ts <phone> --list-remote
 */
const TEMPLATE_LANG: Record<string, string> = {
  seeker_application_confirm_v3: "en_GB",
}

export type WhatsAppResult =
  | { ok: true; messageId: string }
  | { ok: false; error: string }

// ── Core sender ───────────────────────────────────────────────────────────────

function normalizePhone(phone: string): string {
  // Accepts: 9876543210, +919876543210, 919876543210
  const digits = phone.replace(/\D/g, "")
  if (digits.startsWith("91") && digits.length === 12) return digits
  if (digits.length === 10) return `91${digits}`
  return digits
}

/**
 * Posts to the Cloud API and reports what happened.
 *
 * Never throws: a notification must not fail the request that triggered it.
 * But unlike the previous implementation it does not swallow failures either —
 * every failure is logged with the reason and returned to the caller. A dead
 * credential went unnoticed for weeks precisely because the old version
 * reported nothing.
 */
async function send(to: string, payload: object): Promise<WhatsAppResult> {
  if (!TOKEN || !PHONE_NUMBER_ID) {
    const error = "WHATSAPP_TOKEN or WHATSAPP_PHONE_NUMBER_ID not set"
    console.error("[WhatsApp] not configured —", error)
    return { ok: false, error }
  }

  const url = `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: normalizePhone(to),
        ...payload,
      }),
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      // Meta nests the useful part under error.message / error.code.
      const err = data?.error
      const error = err ? `${err.code} ${err.message}` : `HTTP ${res.status}`
      console.error(`[WhatsApp] send failed to ${normalizePhone(to)}:`, error)
      return { ok: false, error }
    }

    return { ok: true, messageId: data?.messages?.[0]?.id ?? "unknown" }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    console.error("[WhatsApp] network error:", error)
    return { ok: false, error }
  }
}

// ── Low-level helpers ─────────────────────────────────────────────────────────

/** Send a free-form text (only valid within 24h after user messages you) */
export async function sendWhatsAppText(phone: string, text: string) {
  return send(phone, { type: "text", text: { body: text } })
}

/**
 * Send an approved template message.
 * templateId = the template name as approved on the WABA.
 * params = ordered list of {{1}}, {{2}} … body values.
 */
export async function sendWhatsAppTemplate(
  phone: string,
  templateId: string,
  params: string[]
) {
  return send(phone, {
    type: "template",
    template: {
      name: templateId,
      language: { code: TEMPLATE_LANG[templateId] ?? LANG },
      // Omit components entirely for a template with no variables; Meta
      // rejects an empty parameters array.
      ...(params.length
        ? {
            components: [
              {
                type: "body",
                parameters: params.map((text) => ({ type: "text", text })),
              },
            ],
          }
        : {}),
    },
  })
}

// ── Notification helpers ──────────────────────────────────────────────────────

/** Seeker: welcome message on signup (phone-only users) */
export async function sendSeekerWelcomeWhatsApp(phone: string, name: string) {
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
  return sendWhatsAppTemplate(phone, "seeker_application_confirm_v3", [
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
  return sendWhatsAppTemplate(phone, "seeker_rejected_v1", [name, jobTitle])
}

/** Employer: welcome message on registration (phone-only) */
export async function sendEmployerWelcomeWhatsApp(
  phone: string,
  companyName: string
) {
  return sendWhatsAppTemplate(phone, "employer_welcome_v1", [companyName])
}

/** Employer: new application received */
export async function sendEmployerApplicationWhatsApp(
  phone: string,
  employerName: string,
  seekerName: string,
  jobTitle: string
) {
  return sendWhatsAppTemplate(phone, "employer_new_application_v1", [
    employerName, seekerName, jobTitle,
  ])
}

/**
 * Employer: account verified / onboarding complete.
 *
 * Body is "Hi {{1}}, your employer profile for {{2}} … has been approved",
 * so the contact person comes first and the company second. Passing only the
 * company (as this did) is a 132000 parameter-count rejection.
 */
export async function sendEmployerOnboardingWhatsApp(
  phone: string,
  contactPerson: string,
  companyName: string
) {
  return sendWhatsAppTemplate(phone, "employer_onboarding_complete_v1", [
    contactPerson, companyName,
  ])
}
