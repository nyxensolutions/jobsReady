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

  const apiKey = process.env.TWOFACTOR_API_KEY
  if (!apiKey) {
    console.log(`[DEV] OTP for ${phone}: ${otp}`)
    return NextResponse.json({ success: true })
  }

  let smsFailed = false
  try {
    const res = await fetch(
      `https://2factor.in/API/V1/${apiKey}/SMS/${phone}/${otp}/JOBRDYOTP`,
      { method: "GET" }
    )
    const data = await res.json()
    console.log("[2Factor OTP response]", JSON.stringify(data))
    if (data.Status !== "Success") throw new Error(data.Details ?? "SMS send failed")
  } catch (err: any) {
    console.error("2Factor OTP error:", err.message)
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

