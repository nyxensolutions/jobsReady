import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import { sendAdminNewEmployerAlert, sendEmployerWelcomeEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  const { companyName, email, contactPerson, contactPhone, industry, city, gstCin, website } =
    await req.json()

  if (!companyName || !contactPerson || !contactPhone || !industry || !city) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  // Must be authenticated
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Check if profile exists to determine if this is a new signup
  const existingProfile = await prisma.employerProfile.findUnique({ where: { userId: session.uid } })

  // Upsert user as EMPLOYER
  const dbUser = await prisma.user.upsert({
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

  if (!existingProfile) {
    // Both sends are side-effects of registration, not the point of it, so
    // they must not fail the request. They are awaited together rather than
    // dropped with a bare `void`, which is how earlier notification bugs
    // stayed invisible for weeks.
    const results = await Promise.allSettled([
      dbUser.email
        ? sendEmployerWelcomeEmail({ email: dbUser.email, companyName })
        : Promise.resolve(),
      // The employer lands on PENDING and cannot unlock candidate contacts
      // until an admin verifies them, so this alert is what keeps that wait
      // short.
      sendAdminNewEmployerAlert({
        companyName,
        contactPerson,
        contactPhone,
        email: dbUser.email,
        industry,
        city,
        gstCin: gstCin || null,
        website: website || null,
      }),
    ])
    for (const r of results) {
      if (r.status === "rejected") console.error("[employer/register] notification failed:", r.reason)
    }
  }

  return NextResponse.json({ success: true })
}
