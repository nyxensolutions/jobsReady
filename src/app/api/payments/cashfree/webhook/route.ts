import { NextRequest, NextResponse } from "next/server"
import { createHmac } from "crypto"
import { prisma } from "@/lib/db"

/**
 * Cashfree webhook — authoritative payment notification.
 * Verifies x-webhook-signature with HMAC-SHA256(timestamp + rawBody, CASHFREE_SECRET_KEY).
 * On PAYMENT_SUCCESS_WEBHOOK: cancels any existing sub, creates a new ACTIVE subscription.
 */
export async function POST(req: NextRequest) {
  const timestamp = req.headers.get("x-webhook-timestamp") ?? ""
  const receivedSig = req.headers.get("x-webhook-signature") ?? ""
  const rawBody = await req.text()

  // ── Verify signature ──────────────────────────────────────────────────────
  const expectedSig = createHmac("sha256", process.env.CASHFREE_SECRET_KEY!)
    .update(timestamp + rawBody)
    .digest("base64")

  if (expectedSig !== receivedSig) {
    console.warn("[cashfree/webhook] Invalid signature")
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let payload: any
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const eventType: string = payload.type ?? ""
  const orderData = payload.data?.order ?? {}
  const paymentData = payload.data?.payment ?? {}

  // Only process successful payments
  if (eventType !== "PAYMENT_SUCCESS_WEBHOOK") {
    console.log(`[cashfree/webhook] Ignoring event: ${eventType}`)
    return NextResponse.json({ received: true })
  }

  const cfOrderId: string = orderData.order_id ?? ""
  const cfPaymentId: string = String(paymentData.cf_payment_id ?? "")
  const tags = orderData.order_tags ?? {}
  const employerId: string = tags.employerId ?? ""
  const planSlug: string = tags.planSlug ?? ""

  if (!employerId || !planSlug || !cfOrderId) {
    console.error("[cashfree/webhook] Missing required fields", { employerId, planSlug, cfOrderId })
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }

  // ── Idempotency — skip if already processed ───────────────────────────────
  const existing = await prisma.subscription.findFirst({
    where: { razorpayOrderId: cfOrderId },  // reusing the field for cf order id
  })
  if (existing) {
    console.log("[cashfree/webhook] Already processed:", cfOrderId)
    return NextResponse.json({ received: true, duplicate: true })
  }

  // ── Fetch plan ────────────────────────────────────────────────────────────
  const plan = await prisma.plan.findUnique({ where: { slug: planSlug } })
  if (!plan) {
    console.error("[cashfree/webhook] Plan not found:", planSlug)
    return NextResponse.json({ error: "Plan not found" }, { status: 404 })
  }

  // ── Cancel existing active/trial subs ─────────────────────────────────────
  await prisma.subscription.updateMany({
    where: { employerId, status: { in: ["ACTIVE", "TRIAL"] } },
    data: { status: "CANCELLED" },
  })

  // ── Create new subscription ───────────────────────────────────────────────
  const now = new Date()
  const expiresAt = new Date(now)
  expiresAt.setDate(expiresAt.getDate() + plan.durationDays)

  await prisma.subscription.create({
    data: {
      employerId,
      planId: plan.id,
      status: plan.isTrial ? "TRIAL" : "ACTIVE",
      startedAt: now,
      expiresAt,
      razorpayOrderId: cfOrderId,      // storing Cashfree order id here
      razorpayPaymentId: cfPaymentId,  // storing Cashfree payment id here
    },
  })

  // ── Upgrade existing active jobs to high-reach ────────────────────────────
  await prisma.jobListing.updateMany({
    where: { employerId, status: "ACTIVE" },
    data: { isHighReach: true },
  })

  console.log(`[cashfree/webhook] ✅ Subscription activated: employer=${employerId} plan=${planSlug}`)
  return NextResponse.json({ received: true, success: true })
}
