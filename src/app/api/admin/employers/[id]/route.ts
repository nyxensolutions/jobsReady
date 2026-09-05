import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"

async function assertAdmin() {
  const session = await getServerSession()
  if (!session) return false
  const dbUser = await prisma.user.findUnique({ where: { id: session.uid } })
  return dbUser?.role === "ADMIN"
}

import { sendEmployerOnboardingCompleteEmail, sendEmployerVerificationRejectedAlert } from "@/lib/email"
import { sendPushToUser } from "@/lib/push"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!await assertAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

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
    select: { id: true, companyName: true, contactPerson: true, status: true, userId: true },
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

    // Send push notification
    sendPushToUser(employer.userId, {
      title: msg.title,
      body: msg.body,
      data: { employerId: id, type: "EMPLOYER_STATUS" }
    })
  }

  // Send email
  if (action === "verify" || action === "reject") {
    void (async () => {
      try {
        const empUser = await prisma.user.findUnique({ where: { id: employer.userId }, select: { email: true } })
        if (empUser?.email) {
          if (action === "verify") {
            await sendEmployerOnboardingCompleteEmail({
              email: empUser.email,
              companyName: employer.companyName,
              contactPerson: employer.contactPerson,
            })
          } else {
            await sendEmployerVerificationRejectedAlert({ employerEmail: empUser.email, employerName: employer.companyName })
          }
        }
      } catch (err) {
        console.error("[admin/employers/notify] Email notification failed:", err)
      }
    })()
  }

  return NextResponse.json({ success: true, status: employer.status })
}
