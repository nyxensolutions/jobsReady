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

  // Validate companyName length and format
  if (companyName !== undefined) {
    const name = companyName.trim()
    if (name.length < 3) {
      return NextResponse.json({ error: "Company name must be at least 3 characters" }, { status: 400 })
    }
    if (name.length > 100) {
      return NextResponse.json({ error: "Company name must be under 100 characters" }, { status: 400 })
    }
    // Reject if it looks like random keyboard mashing (no vowels and >4 chars)
    const hasVowel = /[aeiouAEIOU]/.test(name)
    if (!hasVowel && name.replace(/\s/g, "").length > 4) {
      return NextResponse.json({ error: "Please enter a valid company name" }, { status: 400 })
    }
  }

  // Validate contactPerson
  if (contactPerson !== undefined && contactPerson?.trim()) {
    if (contactPerson.trim().length < 2) {
      return NextResponse.json({ error: "Contact person name must be at least 2 characters" }, { status: 400 })
    }
    if (contactPerson.trim().length > 100) {
      return NextResponse.json({ error: "Contact person name is too long" }, { status: 400 })
    }
  }

  // Validate contactPhone — must be 10 digits starting with 6-9
  if (contactPhone !== undefined && contactPhone?.trim()) {
    const phone = contactPhone.trim().replace(/\D/g, "")
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json({ error: "Enter a valid 10-digit Indian mobile number" }, { status: 400 })
    }
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
