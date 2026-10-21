import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { sendEmployerOnboardingCompleteEmail, sendEmployerVerificationRejectedAlert } from "@/lib/email"
import { sendEmployerOnboardingWhatsApp } from "@/lib/whatsapp"
import { sendPushToUser } from "@/lib/push"
import { assertAdmin } from "@/lib/admin"

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

  // Send email and, on approval, the WhatsApp equivalent
  if (action === "verify" || action === "reject") {
    void (async () => {
      try {
        const empUser = await prisma.user.findUnique({ where: { id: employer.userId }, select: { email: true, phone: true } })

        // The template reads "Hi {{1}}, your employer profile for {{2}} … has
        // been approved", so contact person first, company second. Phone-only
        // employers have no email, which is why this is not nested under it.
        if (action === "verify" && empUser?.phone) {
          const result = await sendEmployerOnboardingWhatsApp(
            empUser.phone,
            employer.contactPerson ?? employer.companyName,
            employer.companyName
          )
          if (!result.ok) {
            console.error("[admin/employers/notify] WhatsApp failed:", result.error)
          }
        }

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
