import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const employer = await prisma.employerProfile.findUnique({ where: { userId: session.uid } })
  if (!employer) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json(employer)
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const dbUser = await prisma.user.findUnique({ where: { id: session.uid } })
  if (!dbUser || dbUser.role !== "EMPLOYER") return NextResponse.json({ error: "Employers only" }, { status: 403 })

  const body = await req.json()
  const { companyName, industry, contactPerson, contactPhone, city, website, description, logoUrl } = body

  // companyName is only required if this isn't a logo-only patch
  const isLogoOnlyPatch = logoUrl !== undefined && companyName === undefined
  if (!isLogoOnlyPatch && !companyName?.trim()) {
    return NextResponse.json({ error: "Company name is required" }, { status: 400 })
  }

  // Build update payload from whichever fields were sent
  const data: Record<string, unknown> = {}
  if (companyName !== undefined)   data.companyName = companyName.trim()
  if (industry !== undefined)      data.industry = industry?.trim() || null
  if (contactPerson !== undefined) data.contactPerson = contactPerson?.trim() || null
  if (contactPhone !== undefined)  data.contactPhone = contactPhone?.trim() || null
  if (city !== undefined)          data.city = city?.trim() || null
  if (website !== undefined)       data.website = website?.trim() || null
  if (description !== undefined)   data.description = description?.trim() || null
  if (logoUrl !== undefined)       data.logoUrl = logoUrl || null   // "" → null (remove logo)

  const updated = await prisma.employerProfile.update({
    where: { userId: session.uid },
    data,
  })

  return NextResponse.json({ success: true, employer: updated })
}
