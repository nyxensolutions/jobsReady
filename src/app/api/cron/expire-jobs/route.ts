import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

/** One updateMany, but a cold connection to a sleeping DB can still be slow. */
export const maxDuration = 60

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret") ?? req.nextUrl.searchParams.get("secret")
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { count } = await prisma.jobListing.updateMany({
    where: {
      status: "ACTIVE",
      expiresAt: { lt: new Date() },
    },
    data: { status: "EXPIRED" },
  })

  console.log(`[cron/expire-jobs] Expired ${count} job(s)`)
  return NextResponse.json({ expired: count })
}
