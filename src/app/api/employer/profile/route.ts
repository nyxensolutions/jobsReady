import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const employer = await prisma.employerProfile.findUnique({ where: { userId: user.id } })
  if (!employer) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json(employer)
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  if (!dbUser || dbUser.role !== "EMPLOYER") return NextResponse.json({ error: "Employers only" }, { status: 403 })

  const { companyName, industry, contactPerson, contactPhone, city, website, description } = await req.json()
  if (!companyName?.trim()) return NextResponse.json({ error: "Company name is required" }, { status: 400 })

  const updated = await prisma.employerProfile.update({
    where: { userId: user.id },
    data: {
      companyName: companyName.trim(),
      industry: industry?.trim() || null,
      contactPerson: contactPerson?.trim() || null,
      contactPhone: contactPhone?.trim() || null,
      city: city?.trim() || null,
      website: website?.trim() || null,
      description: description?.trim() || null,
    },
  })

  return NextResponse.json({ success: true, employer: updated })
}
