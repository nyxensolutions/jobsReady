import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db"

async function assertAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const dbUser = await prisma.user.findFirst({ where: { OR: [{ email: user.email }, { phone: user.email?.split("@")[0] }] } })
  return dbUser?.role === "ADMIN"
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  if (!await assertAdmin(supabase)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const status = req.nextUrl.searchParams.get("status") ?? "PENDING_REVIEW"

  const jobs = await prisma.jobListing.findMany({
    where: { status: status as any },
    include: {
      employer: { select: { companyName: true, contactPerson: true, contactPhone: true, status: true } },
      category: { select: { nameEn: true } },
      city: { select: { name: true } },
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: "asc" },
    take: 100,
  })
  return NextResponse.json(jobs)
}
