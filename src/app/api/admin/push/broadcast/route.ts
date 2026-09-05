import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import { sendPushBroadcast, type BroadcastAudience } from "@/lib/push"

const AUDIENCES: BroadcastAudience[] = ["SEEKER", "EMPLOYER"]

/** Notification rows are written in batches so a large audience stays one round trip each. */
const NOTIFICATION_CHUNK = 1000

const MAX_TITLE = 80
const MAX_BODY = 240

async function assertAdmin() {
  const session = await getServerSession()
  if (!session) return false
  const dbUser = await prisma.user.findUnique({ where: { id: session.uid } })
  return dbUser?.role === "ADMIN"
}

function isAudience(value: unknown): value is BroadcastAudience {
  return typeof value === "string" && AUDIENCES.includes(value as BroadcastAudience)
}

/**
 * GET /api/admin/push/broadcast — reach, per audience.
 *
 * `users` is everyone who will get the in-app notification; `devices` is the
 * subset reachable by push. They differ because web-only users never register
 * an FCM token, and the gap is worth showing before an admin hits send.
 */
export async function GET() {
  if (!(await assertAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const reach = await Promise.all(
    AUDIENCES.map(async (audience) => {
      const [users, withTokens] = await Promise.all([
        prisma.user.count({ where: { role: audience, isActive: true } }),
        prisma.user.findMany({
          where: { role: audience, isActive: true, NOT: { fcmTokens: { isEmpty: true } } },
          select: { fcmTokens: true },
        }),
      ])
      const devices = new Set(withTokens.flatMap((u) => u.fcmTokens)).size
      return [audience, { users, devices }] as const
    })
  )

  return NextResponse.json(Object.fromEntries(reach))
}

/**
 * POST /api/admin/push/broadcast — send one message to one audience.
 *
 * Writes a Notification row for every user in the audience (so the message is
 * still there in the in-app bell for anyone who had push off or was offline),
 * then pushes to the devices that are registered.
 */
export async function POST(req: NextRequest) {
  if (!(await assertAdmin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { audience, title, body } = await req.json()

  if (!isAudience(audience)) {
    return NextResponse.json({ error: "audience must be SEEKER or EMPLOYER" }, { status: 400 })
  }
  const cleanTitle = typeof title === "string" ? title.trim() : ""
  const cleanBody = typeof body === "string" ? body.trim() : ""
  if (!cleanTitle || !cleanBody) {
    return NextResponse.json({ error: "title and body are required" }, { status: 400 })
  }
  if (cleanTitle.length > MAX_TITLE || cleanBody.length > MAX_BODY) {
    return NextResponse.json(
      { error: `title must be ${MAX_TITLE} characters or fewer and body ${MAX_BODY} or fewer` },
      { status: 400 }
    )
  }

  const recipients = await prisma.user.findMany({
    where: { role: audience, isActive: true },
    select: { id: true },
  })

  for (let i = 0; i < recipients.length; i += NOTIFICATION_CHUNK) {
    await prisma.notification.createMany({
      data: recipients.slice(i, i + NOTIFICATION_CHUNK).map((u) => ({
        userId: u.id,
        type: "ADMIN_BROADCAST",
        title: cleanTitle,
        body: cleanBody,
      })),
    })
  }

  // Delivery failures must not lose the notification rows already written, so
  // the push is reported rather than thrown.
  try {
    const result = await sendPushBroadcast({
      audience,
      title: cleanTitle,
      body: cleanBody,
      data: { type: "ADMIN_BROADCAST" },
    })
    return NextResponse.json({ audience, notified: recipients.length, ...result })
  } catch (err) {
    console.error("broadcast push failed:", err)
    return NextResponse.json(
      {
        audience,
        notified: recipients.length,
        devices: 0,
        sent: 0,
        failed: 0,
        pruned: 0,
        warning: "Saved to in-app notifications, but push delivery failed.",
      },
      { status: 207 }
    )
  }
}
