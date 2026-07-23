import { NextRequest, NextResponse } from "next/server"

const OTP_STORE = new Map<string, { otp: string; expiresAt: number }>()

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  const { phone } = await req.json()

  if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
    return NextResponse.json({ error: "Invalid phone number" }, { status: 400 })
  }

  const otp = generateOtp()
  const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes
  OTP_STORE.set(phone, { otp, expiresAt })

  const apiKey = process.env.FAST2SMS_API_KEY
  if (!apiKey) {
    // Dev mode: log OTP to console
    console.log(`[DEV] OTP for ${phone}: ${otp}`)
    return NextResponse.json({ success: true })
  }

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
    // Still log in dev so testing isn't blocked
    console.log(`[FALLBACK] OTP for ${phone}: ${otp}`)
  }

  return NextResponse.json({ success: true })
}

export { OTP_STORE }
