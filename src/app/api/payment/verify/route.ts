import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import { verifyPaymentSignature } from "@/lib/razorpay"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const employer = await prisma.employerProfile.findUnique({
      where: { userId: session.uid },
    })
    if (!employer) return NextResponse.json({ error: "Employer not found" }, { status: 404 })

    const { orderId, paymentId, signature, planSlug } = await req.json()
    if (!orderId || !paymentId || !signature || !planSlug) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    // Verify HMAC signature
    const valid = verifyPaymentSignature({ orderId, paymentId, signature })
    if (!valid) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 })
    }

    const plan = await prisma.plan.findUnique({ where: { slug: planSlug } })
    if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 })

    const now = new Date()
    const expiresAt = new Date(now)
    expiresAt.setDate(expiresAt.getDate() + plan.durationDays)

    // Cancel any existing active subscriptions first
    await prisma.subscription.updateMany({
      where: { employerId: employer.id, status: { in: ["ACTIVE", "TRIAL"] } },
      data: { status: "CANCELLED" },
    })

    // Create new subscription
    const sub = await prisma.subscription.create({
      data: {
        employerId: employer.id,
        planId: plan.id,
        status: plan.isTrial ? "TRIAL" : "ACTIVE",
        startedAt: now,
        expiresAt,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
      },
      include: { plan: true },
    })

    // Mark employer's active jobs as high-reach if plan supports it
    await prisma.jobListing.updateMany({
      where: { employerId: employer.id, status: "ACTIVE" },
      data: { isHighReach: true },
    })

    return NextResponse.json({
      success: true,
      subscription: {
        id: sub.id,
        planName: sub.plan.name,
        expiresAt: sub.expiresAt,
        status: sub.status,
      },
    })
  } catch (err) {
    console.error("[payment/verify]", err)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
