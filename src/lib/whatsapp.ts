import { logMessage } from "./messageLog"

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
async function send(
  to: string,
  payload: object,
  /** Template or helper name, for grouping sends by purpose in message_logs. */
  template = "whatsapp"
): Promise<WhatsAppResult> {
  if (!TOKEN || !PHONE_NUMBER_ID) {
    const error = "WHATSAPP_TOKEN or WHATSAPP_PHONE_NUMBER_ID not set"
    console.error("[WhatsApp] not configured —", error)
    logMessage({ channel: "WHATSAPP", template, recipient: to, ok: false, error })
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
      logMessage({ channel: "WHATSAPP", template, recipient: normalizePhone(to), ok: false, error })
      return { ok: false, error }
    }

    const messageId = data?.messages?.[0]?.id ?? "unknown"
    logMessage({ channel: "WHATSAPP", template, recipient: normalizePhone(to), ok: true, providerId: messageId })
    return { ok: true, messageId }
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    console.error("[WhatsApp] network error:", error)
    logMessage({ channel: "WHATSAPP", template, recipient: normalizePhone(to), ok: false, error })
    return { ok: false, error }
  }
}

// ── Low-level helpers ─────────────────────────────────────────────────────────

/** Send a free-form text (only valid within 24h after user messages you) */
export async function sendWhatsAppText(phone: string, text: string) {
  return send(phone, { type: "text", text: { body: text } }, "whatsapp_text")
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
  return send(
    phone,
    {
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
    },
    templateId
  )
}

// ── Notification helpers ──────────────────────────────────────────────────────

/** Seeker: welcome message on signup (phone-only users) */
export async function sendSeekerWelcomeWhatsApp(phone: string, name: string) {
  return sendWhatsAppTemplate(phone, "seeker_welcome_v1", [name])
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


// ── MARKETING templates ───────────────────────────────────────────────────────
//
// Meta approved three of these as MARKETING, which means they may only be sent
// to a recipient with consent recorded in `users.whatsappOptIn`. Two of the
// three were submitted as Utility and reclassified: the classifier reads a
// message's purpose, not its wording, and anything whose job is to bring the
// recipient back to act is Marketing however factually it is phrased.
//
// Every one of them takes `optIn` as a required argument rather than reading
// the database itself. A call site cannot then forget the check — it has to
// produce the value to call the function at all — and the refusal is logged
// rather than silent, which is the failure mode this file has a history of.

function consentRefusal(template: string, to: string) {
  const error = "no WhatsApp marketing consent on record"
  logMessage({ channel: "WHATSAPP", template, recipient: to, ok: false, error })
  return { ok: false as const, error }
}

/**
 * Seeker: daily digest of new matching jobs. MARKETING.
 */
export async function sendSeekerJobMatchesWhatsApp(
  phone: string,
  optIn: boolean,
  name: string,
  jobCount: number,
  topJobTitle: string,
  topCompany: string,
  topCity: string
) {
  if (!optIn) return consentRefusal("seeker_job_matches_v1", phone)
  return sendWhatsAppTemplate(phone, "seeker_job_matches_v1", [
    name, String(jobCount), topJobTitle, topCompany, topCity,
  ])
}

/**
 * Seeker: an employer shortlisted this profile and invited them to apply.
 * MARKETING — it introduces a relationship that does not exist yet, which is
 * why dropping the button and the header did not make it Utility.
 */
export async function sendSeekerInvitedToApplyWhatsApp(
  phone: string,
  optIn: boolean,
  name: string,
  jobTitle: string,
  companyName: string,
  location: string
) {
  if (!optIn) return consentRefusal("seeker_invited_to_apply_v1", phone)
  return sendWhatsAppTemplate(phone, "seeker_invited_to_apply_v1", [
    name, jobTitle, companyName, location,
  ])
}

/**
 * Employer: subscription about to lapse. MARKETING.
 *
 * `daysLeft` is the whole phrase — "3 days", "1 day" — because a template body
 * cannot pluralise and {{3}} is substituted verbatim.
 */
export async function sendEmployerPlanExpiringWhatsApp(
  phone: string,
  optIn: boolean,
  contactPerson: string,
  planName: string,
  daysLeft: string
) {
  if (!optIn) return consentRefusal("employer_plan_expiring_v1", phone)
  return sendWhatsAppTemplate(phone, "employer_plan_expiring_v1", [
    contactPerson, planName, daysLeft,
  ])
}

// ── UTILITY templates ─────────────────────────────────────────────────────────
//
// These must never be gated on consent. They report a state change to
// something the recipient already owns, and withholding one because somebody
// declined marketing would be withholding information they are owed.

/**
 * Seeker: an employer released their contact details.
 *
 * The one template in this batch that is genuinely urgent for the recipient —
 * their phone number has just been handed to a company — and the only reason
 * it is Utility rather than Marketing is that it reports something that
 * already happened to their own profile.
 */
export async function sendSeekerContactUnlockedWhatsApp(
  phone: string,
  seekerName: string,
  companyName: string
) {
  return sendWhatsAppTemplate(phone, "seeker_contact_unlocked_v1", [
    seekerName, companyName,
  ])
}

/** Employer: a job posting passed moderation and is live. */
export async function sendEmployerJobApprovedWhatsApp(
  phone: string,
  contactPerson: string,
  jobTitle: string
) {
  return sendWhatsAppTemplate(phone, "employer_job_approved_v1", [
    contactPerson, jobTitle,
  ])
}

/**
 * Employer: payment received.
 *
 * `amount` carries its own currency marker ("Rs 999"); the template does not
 * add one.
 */
export async function sendEmployerPaymentReceiptWhatsApp(
  phone: string,
  contactPerson: string,
  amount: string,
  planName: string,
  orderId: string
) {
  return sendWhatsAppTemplate(phone, "employer_payment_receipt_v1", [
    contactPerson, amount, planName, orderId,
  ])
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
