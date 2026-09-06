import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { assertAdmin } from "@/lib/admin"

/**
 * POST /api/admin/employers/bulk
 * body: { action: "verify" | "reject" | "suspend" | "restore", fromStatus: string }
 *
 * Applies the action to every employer currently in `fromStatus`.
 * Returns { count } — number of records updated.
 */
export async function POST(req: NextRequest) {
  if (!await assertAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { action, fromStatus } = await req.json()

  const statusMap: Record<string, string> = {
    verify:  "VERIFIED",
    reject:  "REJECTED",
    suspend: "SUSPENDED",
    restore: "PENDING",
  }

  const newStatus = statusMap[action]
  if (!newStatus || !fromStatus) {
    return NextResponse.json({ error: "Invalid action or fromStatus" }, { status: 400 })
  }

  const extraData = action === "verify" ? { verifiedAt: new Date() } : {}

  const result = await prisma.employerProfile.updateMany({
    where: { status: fromStatus as any },
    data: { status: newStatus as any, ...extraData },
  })

  return NextResponse.json({ count: result.count })
}
