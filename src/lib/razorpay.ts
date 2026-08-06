import Razorpay from "razorpay"
import crypto from "crypto"

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn("[Razorpay] Keys not set — payment features will not work.")
}

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID ?? "",
  key_secret: process.env.RAZORPAY_KEY_SECRET ?? "",
})

/** Verify Razorpay payment signature (HMAC-SHA256). */
export function verifyPaymentSignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string
  paymentId: string
  signature: string
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET ?? ""
  const body = `${orderId}|${paymentId}`
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex")
  return expected === signature
}
