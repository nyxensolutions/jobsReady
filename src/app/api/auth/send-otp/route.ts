import { NextRequest, NextResponse } from "next/server"
import { otpSet } from "@/lib/otp-store"

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  const { phone } = await req.json()

  if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
    return NextResponse.json({ error: "Invalid phone number" }, { status: 400 })
  }

  const otp = generateOtp()
  try {
    await otpSet(phone, otp)
  } catch (err: any) {
    console.error("[send-otp] DB save failed:", err.message)
    return NextResponse.json({ error: "Server error — please try again" }, { status: 500 })
  }

  const apiKey = process.env.FAST2SMS_API_KEY
  if (!apiKey) {
    // Dev mode: log OTP to console
    console.log(`[DEV] OTP for ${phone}: ${otp}`)
    return NextResponse.json({ success: true })
  }

  let smsFailed = false
  try {
    const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        route: "otp",
        variables_values: otp,
        numbers: phone,
      }),
    })
    const data = await res.json()
    if (!data.return) throw new Error(data.message ?? "SMS send failed")
  } catch (err: any) {
    console.error("Fast2SMS error:", err.message)
    console.log(`[OTP FALLBACK] ${phone} → ${otp}`)
    smsFailed = true
  }

  // In dev mode: include OTP in response when SMS delivery failed so testing isn't blocked
  const isDev = process.env.NODE_ENV !== "production"
  return NextResponse.json({
    success: true,
    ...(isDev && smsFailed ? { devOtp: otp } : {}),
  })
}

