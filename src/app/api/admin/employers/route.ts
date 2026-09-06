import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { assertAdmin } from "@/lib/admin"

export async function GET(req: NextRequest) {
  if (!await assertAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const status = req.nextUrl.searchParams.get("status") ?? "PENDING"

  const employers = await prisma.employerProfile.findMany({
    where: { status: status as any },
    include: {
      user: { select: { phone: true, email: true } },
      _count: { select: { jobListings: true } },
    },
    orderBy: { createdAt: "asc" },
    take: 100,
    // All fields returned including docUrls, description, website, gstCin
  })
  return NextResponse.json(employers)
}
