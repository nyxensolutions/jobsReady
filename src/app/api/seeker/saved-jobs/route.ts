import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db"

async function getSeeker(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return prisma.seekerProfile.findFirst({ where: { user: { OR: [{ email: user.email }, { phone: user.email?.split("@")[0] }] } } })
}

export async function GET() {
  const supabase = await createClient()
  const seeker = await getSeeker(supabase)
  if (!seeker) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const saved = await prisma.savedJob.findMany({
    where: { seekerId: seeker.id },
    include: {
      job: {
        include: {
          employer: { select: { companyName: true, contactPhone: true } },
          city: { select: { name: true } },
          category: { select: { slug: true, nameEn: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(saved)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const seeker = await getSeeker(supabase)
  if (!seeker) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { jobId } = await req.json()
  if (!jobId) return NextResponse.json({ error: "jobId required" }, { status: 400 })

  try {
    const saved = await prisma.savedJob.create({ data: { seekerId: seeker.id, jobId } })
    return NextResponse.json(saved, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Already saved" }, { status: 409 })
  }
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const seeker = await getSeeker(supabase)
  if (!seeker) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { jobId } = await req.json()
  await prisma.savedJob.deleteMany({ where: { seekerId: seeker.id, jobId } })
  return NextResponse.json({ ok: true })
}
