import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"

async function assertAdmin() {
  const session = await getServerSession()
  if (!session) return false
  const dbUser = await prisma.user.findUnique({ where: { id: session.uid } })
  return dbUser?.role === "ADMIN"
}

/**
 * POST /api/admin/jobs/bulk
 * body: { action: "approve" | "reject" | "deactivate", fromStatus: string }
 *
 * Applies the action to every job currently in `fromStatus`.
 * Skips per-job email/notification to avoid spam on large batches.
 * Returns { count } — number of records updated.
 */
export async function POST(req: NextRequest) {
  if (!await assertAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { action, fromStatus } = await req.json()

  const actionMap: Record<string, object> = {
    approve: {
      status: "ACTIVE",
      publishedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    reject: { status: "REJECTED" },
    deactivate: { status: "CLOSED" },
    reapprove: {
      status: "ACTIVE",
      publishedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  }

  const data = actionMap[action]
  if (!data || !fromStatus) {
    return NextResponse.json({ error: "Invalid action or fromStatus" }, { status: 400 })
  }

  const result = await prisma.jobListing.updateMany({
    where: { status: fromStatus as any },
    data: data as any,
  })

  return NextResponse.json({ count: result.count })
}
