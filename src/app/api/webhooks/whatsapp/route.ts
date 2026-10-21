import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

/**
 * WhatsApp Cloud API webhook.
 *
 * Without this, outbound messages are write-only: the send API returns
 * "accepted" and nothing afterwards says whether the message reached the
 * handset. That blind spot is how a dead provider went unnoticed for weeks.
 *
 * Meta calls GET once to verify the endpoint, then POSTs status transitions
 * (sent -> delivered -> read, or failed) and any inbound messages.
 *
 * Setup: Meta app > WhatsApp > Configuration > Webhook
 *   Callback URL : https://<your-domain>/api/webhooks/whatsapp
 *   Verify token : the value of WHATSAPP_WEBHOOK_VERIFY_TOKEN
 *   Subscribe to : messages
 *
 * Note: while the Meta app is unpublished only test webhooks are delivered,
 * so production statuses start flowing once the app is published.
 */

const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN
const APP_SECRET = process.env.WHATSAPP_APP_SECRET

/** Meta's one-time subscription handshake. */
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const mode = params.get("hub.mode")
  const token = params.get("hub.verify_token")
  const challenge = params.get("hub.challenge")

  if (!VERIFY_TOKEN) {
    console.error("[wa-webhook] WHATSAPP_WEBHOOK_VERIFY_TOKEN not set")
    return new NextResponse("Not configured", { status: 500 })
  }

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    // Meta requires the raw challenge echoed back as plain text.
    return new NextResponse(challenge ?? "", { status: 200 })
  }

  return new NextResponse("Forbidden", { status: 403 })
}

/**
 * Confirms the payload really came from Meta.
 *
 * Optional: skipped when WHATSAPP_APP_SECRET is unset, since the endpoint is
 * still useful without it, but set it in production — the URL is public and
 * anyone could otherwise post fabricated delivery data.
 */
function signatureValid(raw: string, header: string | null): boolean {
  if (!APP_SECRET) return true
  if (!header?.startsWith("sha256=")) return false
  const expected = crypto.createHmac("sha256", APP_SECRET).update(raw).digest("hex")
  const got = header.slice("sha256=".length)
  // Lengths must match before timingSafeEqual, which throws otherwise.
  if (got.length !== expected.length) return false
  return crypto.timingSafeEqual(Buffer.from(got), Buffer.from(expected))
}

type Status = {
  id: string
  status: string
  recipient_id?: string
  errors?: { code: number; title?: string; message?: string }[]
}

export async function POST(req: NextRequest) {
  const raw = await req.text()

  if (!signatureValid(raw, req.headers.get("x-hub-signature-256"))) {
    console.error("[wa-webhook] bad signature")
    return new NextResponse("Forbidden", { status: 403 })
  }

  let body: Record<string, unknown>
  try {
    body = JSON.parse(raw)
  } catch {
    return new NextResponse("Bad request", { status: 400 })
  }

  try {
    const entries = (body.entry ?? []) as {
      changes?: { field?: string; value?: Record<string, unknown> }[]
    }[]

    for (const entry of entries) {
      for (const change of entry.changes ?? []) {
        const value = change.value ?? {}

        switch (change.field) {
          // Approved / rejected / disabled. Worth shouting about: a template
          // disabled by Meta fails every send that uses it, and nothing in the
          // app would otherwise say why.
          case "message_template_status_update": {
            const event = String(value.event ?? "")
            const name = String(value.message_template_name ?? "")
            const reason = value.reason && value.reason !== "NONE" ? ` reason=${value.reason}` : ""
            const line = `[wa-webhook] template ${name} -> ${event}${reason}`
            if (event === "APPROVED") console.log(line)
            else console.error(line)
            break
          }

          // Quality dropping is the warning before a template is paused.
          case "message_template_quality_update":
            console.error(
              `[wa-webhook] template quality ${value.message_template_name}: ${value.previous_quality_score} -> ${value.new_quality_score}`
            )
            break

          // The number's own rating. RED precedes messaging limits.
          case "phone_number_quality_update":
            console.error(
              `[wa-webhook] number quality ${value.display_phone_number}: ${value.event} (limit ${value.current_limit})`
            )
            break

          // Bans, restrictions and policy violations on the WABA itself.
          case "account_update":
            console.error(`[wa-webhook] account ${value.event}: ${JSON.stringify(value).slice(0, 300)}`)
            break

          default: {
            for (const st of (value.statuses ?? []) as Status[]) {
              if (st.status === "failed") {
                // Accepted by the send API, then dropped. Meta's reason is the
                // only way to tell why.
                const reason = st.errors
                  ?.map((e) => `${e.code} ${e.title ?? e.message ?? ""}`)
                  .join("; ")
                console.error(
                  `[wa-webhook] FAILED to ${st.recipient_id} (${st.id}): ${reason ?? "no reason given"}`
                )
              } else {
                console.log(`[wa-webhook] ${st.status} -> ${st.recipient_id} (${st.id})`)
              }
            }

            for (const m of (value.messages ?? []) as { from?: string; type?: string }[]) {
              // Inbound opens a free 24h service window. Nothing acts on it yet.
              console.log(`[wa-webhook] inbound ${m.type} from ${m.from}`)
            }
          }
        }
      }
    }
  } catch (err) {
    // Always 200 regardless: a non-200 makes Meta retry, and repeated
    // failures get the webhook unsubscribed.
    console.error("[wa-webhook] handler error:", err)
  }

  return NextResponse.json({ received: true })
}
