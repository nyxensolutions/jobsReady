import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"

// GET /api/seeker/applications — "My Applications" list with status tracking.
// (Single-application get/withdraw lives in ./[id]/route.ts.)
export async function GET() {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const seeker = await prisma.seekerProfile.findUnique({ where: { userId: session.uid } })
  if (!seeker) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

  const applications = await prisma.application.findMany({
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
  return NextResponse.json(applications)
}
