import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"

async function assertAdmin() {
  const session = await getServerSession()
  if (!session) return false
  const dbUser = await prisma.user.findUnique({ where: { id: session.uid } })
  return dbUser?.role === "ADMIN"
}

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
