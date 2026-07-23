import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  const { companyName, email, contactPerson, contactPhone, industry, city, gstCin, website } =
    await req.json()

  if (!companyName || !email || !contactPerson || !contactPhone || !industry || !city) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const supabase = await createAdminClient()

  // Create or fetch Supabase auth user for this email
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback?next=/employer/dashboard`,
    data: { role: "EMPLOYER" },
  })

  if (error && !error.message.includes("already been registered")) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const authId = data?.user?.id

  // Upsert user in our DB
  const user = await prisma.user.upsert({
    where: { email },
    create: { id: authId, email, role: "EMPLOYER" },
    update: { role: "EMPLOYER" },
  })

  // Create employer profile (idempotent)
  await prisma.employerProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
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
