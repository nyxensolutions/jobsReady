import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"

async function getSeeker(uid: string) {
  return prisma.seekerProfile.findUnique({ where: { userId: uid } })
}

export async function GET() {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const seeker = await getSeeker(session.uid)
  if (!seeker) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

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
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const seeker = await getSeeker(session.uid)
  if (!seeker) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

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
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const seeker = await getSeeker(session.uid)
  if (!seeker) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

  const { jobId } = await req.json()
  await prisma.savedJob.deleteMany({ where: { seekerId: seeker.id, jobId } })
  return NextResponse.json({ ok: true })
}
