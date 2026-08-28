import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"

const CF_BASE =
  process.env.CASHFREE_ENV === "PROD"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg"

const CF_HEADERS = {
  "Content-Type": "application/json",
  "x-client-id": process.env.CASHFREE_APP_ID!,
  "x-client-secret": process.env.CASHFREE_SECRET_KEY!,
  "x-api-version": "2023-08-01",
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const dbUser = await prisma.user.findUnique({ where: { id: session.uid } })
    if (!dbUser || dbUser.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Employers only" }, { status: 403 })
    }

    const employer = await prisma.employerProfile.findUnique({
      where: { userId: session.uid },
    })
    if (!employer) return NextResponse.json({ error: "Employer not found" }, { status: 404 })

    const { planSlug } = await req.json()
    if (!planSlug) return NextResponse.json({ error: "planSlug required" }, { status: 400 })

    const plan = await prisma.plan.findUnique({ where: { slug: planSlug, isActive: true } })
    if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 })

    // Build a clean phone number — Cashfree requires exactly 10 digits, no +91
    const rawPhone = employer.contactPhone ?? dbUser.phone ?? ""
    const phone = rawPhone.replace(/^\+91/, "").replace(/\D/g, "").slice(-10)
    const safePhone = phone.length === 10 ? phone : "9999999999"

    // customer_email is required by Cashfree; fall back to a placeholder
    const email = dbUser.email || `emp_${employer.id.slice(0, 8)}@jobs24india.com`

    const orderId = `jr_${employer.id.slice(0, 8)}_${Date.now()}`
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://jobs24india.com"

    const cfRes = await fetch(`${CF_BASE}/orders`, {
      method: "POST",
      headers: CF_HEADERS,
      body: JSON.stringify({
        order_id: orderId,
        order_amount: plan.priceRupees,
        order_currency: "INR",
        customer_details: {
          customer_id: employer.id.slice(0, 32),   // max 32 chars
          customer_name: employer.contactPerson || employer.companyName,
          customer_email: email,
          customer_phone: safePhone,
        },
        order_meta: {
          return_url: `${appUrl}/employer/plans/payment-return?order_id={order_id}`,
          notify_url: `${appUrl}/api/payments/cashfree/webhook`,
        },
        // order_tags stored so the webhook can identify employer + plan
        order_tags: {
          employerId: employer.id,
          planSlug: plan.slug,
        },
      }),
    })

    const cfData = await cfRes.json()
    if (!cfRes.ok) {
      console.error("[cashfree/create-order] Cashfree error:", cfData)
      return NextResponse.json(
        { error: cfData.message ?? "Failed to create Cashfree order" },
        { status: 502 }
      )
    }

    return NextResponse.json({
      paymentSessionId: cfData.payment_session_id,
      orderId: cfData.order_id,
      amount: plan.priceRupees,
      planName: plan.name,
      planSlug: plan.slug,
    })
  } catch (err) {
    console.error("[cashfree/create-order]", err)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
