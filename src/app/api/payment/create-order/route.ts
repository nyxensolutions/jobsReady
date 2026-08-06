import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import { getRazorpay } from "@/lib/razorpay"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const employer = await prisma.employerProfile.findUnique({
      where: { userId: session.uid },
    })
    if (!employer) return NextResponse.json({ error: "Employer not found" }, { status: 404 })

    const { planSlug } = await req.json()
    if (!planSlug) return NextResponse.json({ error: "planSlug required" }, { status: 400 })

    const plan = await prisma.plan.findUnique({ where: { slug: planSlug, isActive: true } })
    if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 })

    // Amount in paise (₹ × 100)
    const amount = plan.priceRupees * 100

    const order = await getRazorpay().orders.create({
      amount,
      currency: "INR",
      receipt: `jr_${employer.id.slice(0, 8)}_${Date.now()}`,
      notes: {
        employerId: employer.id,
        planSlug: plan.slug,
        planName: plan.name,
      },
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      planName: plan.name,
      planSlug: plan.slug,
    })
  } catch (err) {
    console.error("[payment/create-order]", err)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
