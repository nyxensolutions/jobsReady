/**
 * Manual WhatsApp delivery test against the Meta Cloud API.
 *
 * Prints the raw status and response body for each send so an unapproved
 * template, a bad token and a wrong parameter count stay distinguishable —
 * Meta returns a different error code for each.
 *
 *   npx tsx scripts/test-whatsapp.ts 9999999999              # list, send nothing
 *   npx tsx scripts/test-whatsapp.ts 9999999999 --send seeker_welcome_v1
 *   npx tsx scripts/test-whatsapp.ts 9999999999 --send all   # every template
 *
 * Nothing is sent without --send.
 */

const API_VERSION = process.env.WHATSAPP_API_VERSION ?? "v25.0"
const TOKEN = process.env.WHATSAPP_TOKEN
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID
const LANG = process.env.WHATSAPP_TEMPLATE_LANG ?? "en"
/** Mirrors TEMPLATE_LANG in src/lib/whatsapp.ts. */
const TEMPLATE_LANG: Record<string, string> = { seeker_application_confirm_v3: "en_GB" }

/** Mirrors the template ids and parameter order in src/lib/whatsapp.ts. */
const TEMPLATES: Record<string, string[]> = {
  seeker_welcome_v1:             ["Akhil"],
  seeker_job_alert_v1:           ["Akhil", "Delivery Boy", "Gurugram", "₹15K–₹20K/month", "test-job-id"],
  seeker_application_confirm_v3: ["Akhil", "Delivery Boy", "ABC Pvt Ltd"],
  seeker_shortlisted_v1:         ["Akhil", "Delivery Boy", "ABC Pvt Ltd"],
  seeker_viewed_v1:              ["Akhil", "Delivery Boy", "ABC Pvt Ltd"],
  seeker_hired_v1:               ["Akhil", "Delivery Boy", "ABC Pvt Ltd"],
  seeker_rejected_v1:            ["Akhil", "Delivery Boy"],
  employer_welcome_v1:           ["ABC Pvt Ltd"],
  employer_new_application_v1:   ["ABC Pvt Ltd", "Akhil", "Delivery Boy"],
  employer_onboarding_complete_v1: ["Sachin Verma", "ABC Pvt Ltd"],
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (digits.startsWith("91") && digits.length === 12) return digits
  if (digits.length === 10) return `91${digits}`
  return digits
}

async function send(to: string, templateId: string, params: string[]) {
  const url = `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`

  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: normalizePhone(to),
      type: "template",
      template: {
        name: templateId,
        language: { code: TEMPLATE_LANG[templateId] ?? LANG },
        ...(params.length
          ? { components: [{ type: "body", parameters: params.map((text) => ({ type: "text", text })) }] }
          : {}),
      },
    }),
  })

  const text = await res.text()
  console.log(`  ${res.ok ? "✓" : "✗"} ${templateId.padEnd(32)} ${res.status}  ${text.slice(0, 200)}`)
  return res.ok
}

const WABA_ID = process.env.WHATSAPP_WABA_ID ?? "1603050564877428"

/**
 * Lists the templates actually approved on the WABA and reconciles them
 * against the names this app sends. A name or language mismatch is the single
 * most common cause of 132001, and guessing at it is slow.
 */
async function listRemote() {
  const url = `https://graph.facebook.com/${API_VERSION}/${WABA_ID}/message_templates?limit=100`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } })
  const data = await res.json()

  if (!res.ok) {
    console.error("  Could not list templates:", JSON.stringify(data?.error ?? data).slice(0, 300))
    return
  }

  const remote: { name: string; language: string; status: string; vars: number }[] = (
    data.data ?? []
  ).map((t: Record<string, unknown>) => {
    const body = (t.components as { type: string; text?: string }[] | undefined)?.find(
      (c) => c.type === "BODY"
    )
    // Highest {{n}} in the body is the parameter count Meta expects.
    const nums = [...(body?.text ?? "").matchAll(/\{\{(\d+)\}\}/g)].map((m) => Number(m[1]))
    return {
      name: t.name as string,
      language: t.language as string,
      status: t.status as string,
      vars: nums.length ? Math.max(...nums) : 0,
    }
  })

  console.log(`Approved on WABA ${WABA_ID} (${remote.length}):
`)
  for (const t of remote) {
    const expect = TEMPLATES[t.name]
    const mismatch = expect && expect.length !== t.vars ? `  ⚠ app sends ${expect.length}` : ""
    console.log(
      `  ${t.status === "APPROVED" ? "✓" : "•"} ${t.name.padEnd(34)} ${t.language.padEnd(8)} ${String(t.vars).padStart(2)} var(s)${mismatch}`
    )
  }

  const names = new Set(remote.map((t) => t.name))
  const missing = Object.keys(TEMPLATES).filter((n) => !names.has(n))
  const unused = remote.filter((t) => !TEMPLATES[t.name]).map((t) => t.name)

  console.log(`\nThe app sends ${Object.keys(TEMPLATES).length} template(s).`)
  if (missing.length) {
    console.log("\nNOT on the WABA — every send of these fails with 132001:")
    missing.forEach((n) => console.log(`    ✗ ${n}`))
  } else {
    console.log("  All of them exist on the WABA.")
  }
  if (unused.length) {
    console.log("\nOn the WABA but never sent by the app:")
    unused.forEach((n) => console.log(`    · ${n}`))
  }
  console.log()
}

/** Prints a template's approved body text, to see what each {{n}} means. */
async function showTemplate(name: string) {
  const url = `https://graph.facebook.com/${API_VERSION}/${WABA_ID}/message_templates?limit=100`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } })
  const data = await res.json()
  for (const t of data.data ?? []) {
    if (t.name !== name) continue
    console.log(`${t.name}  [${t.language}]  ${t.status}
`)
    for (const c of t.components ?? []) {
      console.log(`  ${c.type}: ${c.text ?? JSON.stringify(c).slice(0, 200)}
`)
    }
    return
  }
  console.log(`  ${name} not found on the WABA`)
}

/**
 * Free-form text, valid only inside the 24h window opened by the recipient
 * messaging the business first.
 *
 * Diagnostic value: a session message bypasses the billing and template
 * machinery entirely. If this arrives and templates do not, delivery works
 * and business-initiated messages specifically are being blocked.
 */
async function sendText(to: string, body: string) {
  const url = `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: normalizePhone(to),
      type: "text",
      text: { body },
    }),
  })
  const text = await res.text()
  console.log(`  ${res.ok ? "✓" : "✗"} ${"(free-form text)".padEnd(32)} ${res.status}  ${text.slice(0, 200)}`)
}

async function main() {
  const [phone, flag, which] = process.argv.slice(2)

  if (!phone) {
    console.error("Usage: npx tsx scripts/test-whatsapp.ts <phone> [--send <template|all> | --list-remote]")
    process.exit(1)
  }
  if (!TOKEN || !PHONE_NUMBER_ID) {
    console.error("WHATSAPP_TOKEN and/or WHATSAPP_PHONE_NUMBER_ID are not set in .env.local.")
    console.error("Get both from Meta: Business Settings -> WhatsApp Accounts -> your WABA -> API Setup.")
    process.exit(1)
  }

  console.log(`\nGraph API       : ${API_VERSION}`)
  console.log(`Phone number ID : ${PHONE_NUMBER_ID}`)
  console.log(`Template lang   : ${LANG}`)
  console.log(`Destination     : +${normalizePhone(phone)}`)
  console.log(`Token           : set (${TOKEN.length} chars)
`)

  if (flag === "--text") {
    await sendText(phone, which || "Jobs24India test message")
    return
  }

  if (flag === "--show") {
    await showTemplate(which)
    return
  }

  if (flag === "--list-remote") {
    await listRemote()
    return
  }

  if (flag !== "--send") {
    console.log("Templates this app sends (nothing sent — pass --send <name|all>):\n")
    for (const [id, params] of Object.entries(TEMPLATES)) {
      console.log(`  ${id.padEnd(34)} ${params.length} param(s)`)
    }
    console.log()
    return
  }

  const targets = which === "all" ? Object.keys(TEMPLATES) : [which]
  for (const id of targets) {
    if (!TEMPLATES[id]) {
      console.error(`Unknown template: ${id}`)
      continue
    }
    await send(phone, id, TEMPLATES[id])
    if (which === "all") await new Promise((r) => setTimeout(r, 1200)) // stay under rate limits
  }
  console.log()
}

main()
