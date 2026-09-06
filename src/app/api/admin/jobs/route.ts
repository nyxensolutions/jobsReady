import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { assertAdmin } from "@/lib/admin"

export async function GET(req: NextRequest) {
  if (!await assertAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const status = req.nextUrl.searchParams.get("status") ?? "PENDING_REVIEW"

  const jobs = await prisma.jobListing.findMany({
    where: { status: status as any },
    include: {
      employer: {
        select: {
          companyName: true, contactPerson: true, contactPhone: true,
          status: true, website: true, description: true, docUrls: true,
        },
      },
      category: { select: { nameEn: true } },
      city: { select: { name: true } },
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "asc" },
    take: 100,
  })
  return NextResponse.json(jobs)
}
