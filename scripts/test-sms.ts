/**
 * 2Factor.in diagnostics — the SMS counterpart to scripts/test-whatsapp.ts.
 *
 *   npx dotenv -e .env.local -- npx tsx scripts/test-sms.ts --balance
 *   npx dotenv -e .env.local -- npx tsx scripts/test-sms.ts --catalogue
 *   npx dotenv -e .env.local -- npx tsx scripts/test-sms.ts --send 9953452046
 *   npx dotenv -e .env.local -- npx tsx scripts/test-sms.ts --send 9953452046 --template JOBRDYOTP 1234
 *
 * --send with no --template posts a free-text body, which is what the app does
 * today. Under India's DLT rules that is expected to be refused; running it is
 * how you confirm whether this channel works at all.
 */
import { MSG, sendSms } from "../src/lib/sms"

const KEY = process.env.TWOFACTOR_API_KEY ?? ""
const SENDER = process.env.TWOFACTOR_SENDER_ID ?? "JBSRDY"

async function api(path: string) {
  const res = await fetch(`https://2factor.in/API/V1/${KEY}/${path}`)
  return (await res.json().catch(() => null)) as { Status?: string; Details?: string } | null
}

async function balance() {
  console.log(`sender id: ${SENDER}`)
  for (const [label, path] of [
    ["SMS OTP", "BAL/SMS"],
    ["Voice OTP", "BAL/VOICE"],
    ["Transactional SMS", "ADDON_SERVICES/BAL/TRANSACTIONAL_SMS"],
  ] as const) {
    const d = await api(path)
    const val = d?.Status === "Success" ? d.Details : `ERROR: ${d?.Details ?? "no response"}`
    console.log(`  ${label.padEnd(20)} ${val}`)
  }
}

/** Every message body the app can send, so they can be matched against DLT templates. */
function catalogue() {
  const rows: [string, string][] = [
    ["seeker.applied", MSG.seeker.applied("Delivery Boy", "ABC Logistics")],
    ["seeker.viewed", MSG.seeker.viewed("Delivery Boy", "ABC Logistics")],
    ["seeker.shortlisted", MSG.seeker.shortlisted("Delivery Boy", "ABC Logistics")],
    ["seeker.hired", MSG.seeker.hired("Delivery Boy", "ABC Logistics")],
    ["seeker.rejected", MSG.seeker.rejected("Delivery Boy")],
    ["seeker.newJobs", MSG.seeker.newJobs(5)],
    ["seeker.profileIncomplete", MSG.seeker.profileIncomplete()],
    ["employer.newApplication", MSG.employer.newApplication("Delivery Boy", "Ramesh")],
    ["employer.planActivated", MSG.employer.planActivated("Single Hire", 30)],
    ["employer.planExpiringSoon", MSG.employer.planExpiringSoon(3)],
    ["employer.planExpired", MSG.employer.planExpired()],
    ["employer.weeklySummary", MSG.employer.weeklySummary(2, 14)],
  ]
  console.log(`${rows.length} message types need a DLT content template each:\n`)
  for (const [name, body] of rows) console.log(`  ${name}\n    ${body}\n`)
}

/** Template send. This endpoint takes a JSON POST; query parameters are ignored. */
async function sendTemplate(to: string, template: string, vars: string[]) {
  const body: Record<string, string> = { From: SENDER, To: to, TemplateName: template }
  vars.forEach((v, i) => { body[`VAR${i + 1}`] = v })
  const res = await fetch(`https://2factor.in/API/V1/${KEY}/ADDON_SERVICES/SEND/TSMS`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const d = (await res.json().catch(() => null)) as { Status?: string; Details?: string } | null
  console.log(d?.Status === "Success" ? `sent: ${d.Details}` : `refused: ${d?.Details ?? "no response"}`)
}

async function main() {
  const args = process.argv.slice(2)
  if (!KEY) return console.error("TWOFACTOR_API_KEY not set")

  if (args.includes("--balance")) return balance()
  if (args.includes("--catalogue")) return catalogue()

  const i = args.indexOf("--send")
  if (i !== -1) {
    const to = args[i + 1]
    if (!to) return console.error("usage: --send <10-digit-number> [--template <NAME> <var>...]")
    const t = args.indexOf("--template")
    if (t !== -1) return sendTemplate(to, args[t + 1], args.slice(t + 2))
    console.log("sending free-text body (no TemplateName) — this is what the app does today")
    console.log(await sendSms(to, MSG.seeker.applied("Delivery Boy", "ABC Logistics")))
    return
  }
  console.log("flags: --balance | --catalogue | --send <number> [--template <NAME> <var>...]")
}

main().catch((e) => { console.error(e); process.exit(1) })
