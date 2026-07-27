import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db"

async function assertAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const dbUser = await prisma.user.findFirst({ where: { OR: [{ email: user.email }, { phone: user.email?.split("@")[0] }] } })
  return dbUser?.role === "ADMIN"
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  if (!await assertAdmin(supabase)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { action } = await req.json() // "verify" | "reject" | "suspend"

  const statusMap: Record<string, string> = {
    verify:  "VERIFIED",
    reject:  "REJECTED",
    suspend: "SUSPENDED",
    restore: "PENDING",
  }
  const newStatus = statusMap[action]
  if (!newStatus) return NextResponse.json({ error: "Invalid action" }, { status: 400 })

  const employer = await prisma.employerProfile.update({
    where: { id },
    data: {
      status: newStatus as any,
      ...(action === "verify" ? { verifiedAt: new Date() } : {}),
    },
    select: { id: true, companyName: true, status: true, userId: true },
  })

  // In-app notification for employer
  const notifMessages: Record<string, { title: string; body: string }> = {
    verify:  { title: "Company verified ✅", body: "Your company has been verified. You can now post jobs." },
    reject:  { title: "Verification rejected", body: "Your company verification was rejected. Please contact support." },
    suspend: { title: "Account suspended", body: "Your employer account has been suspended. Contact support." },
    restore: { title: "Account restored", body: "Your employer account is under review again." },
  }
  const msg = notifMessages[action]
  if (msg) {
    await prisma.notification.create({
      data: {
        userId: employer.userId,
        type: "EMPLOYER_STATUS",
        title: msg.title,
        body: msg.body,
        data: { employerId: id },
      },
    })
  }

  return NextResponse.json({ success: true, status: employer.status })
}
