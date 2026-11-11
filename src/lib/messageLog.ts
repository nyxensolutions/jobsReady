import { prisma } from "./db"

export type Channel = "EMAIL" | "WHATSAPP" | "SMS" | "PUSH"

interface Entry {
  channel: Channel
  /** The template or helper that produced the message. */
  template: string
  recipient: string
  userId?: string | null
  ok: boolean
  providerId?: string | null
  error?: string | null
}

/**
 * Records one outbound message attempt.
 *
 * Never throws and never blocks the caller. A logging failure must not turn a
 * delivered message into a failed request — the log exists to observe sending,
 * not to gate it.
 *
 * Deliberately not awaited by the send helpers: the write is fire-and-forget
 * so it cannot add latency to a user-facing request that happens to send mail.
 */
export function logMessage(entry: Entry): void {
  void prisma.messageLog
    .create({
      data: {
        channel: entry.channel,
        template: entry.template,
        recipient: entry.recipient,
        userId: entry.userId ?? null,
        ok: entry.ok,
        providerId: entry.providerId ?? null,
        // Provider errors can be long; the first line is the useful part.
        error: entry.error ? String(entry.error).slice(0, 500) : null,
      },
    })
    .catch((err) => {
      console.error("[messageLog] could not record send:", err)
    })
}

/** Normalises whatever a provider threw into something storable. */
export function errorText(err: unknown): string {
  if (!err) return "unknown error"
  if (typeof err === "string") return err
  if (err instanceof Error) return err.message
  const maybe = err as { message?: unknown }
  return typeof maybe.message === "string" ? maybe.message : JSON.stringify(err)
}
