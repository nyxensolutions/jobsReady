import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  const { companyName, email, contactPerson, contactPhone, industry, city, gstCin, website } =
    await req.json()

  if (!companyName || !contactPerson || !contactPhone || !industry || !city) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  // Must be authenticated
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Upsert user as EMPLOYER
  await prisma.user.upsert({
    where: { id: session.uid },
    create: { id: session.uid, role: "EMPLOYER", email: email || null },
    update: { role: "EMPLOYER", ...(email ? { email } : {}) },
  })

  // Create or update employer profile
  await prisma.employerProfile.upsert({
    where: { userId: session.uid },
    create: {
      userId: session.uid,
      companyName,
      contactPerson,
      contactPhone,
      industry,
      city,
      gstCin: gstCin || null,
      website: website || null,
      status: "PENDING",
    },
    update: {
      companyName,
      contactPerson,
      contactPhone,
      industry,
      city,
      gstCin: gstCin || null,
      website: website || null,
    },
  })

  return NextResponse.json({ success: true })
}
