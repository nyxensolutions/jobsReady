import Razorpay from "razorpay"
import crypto from "crypto"

/**
 * Returns a Razorpay instance initialised with env keys.
 * Called lazily at request time — never at module evaluation — so the build
 * succeeds even when the keys are not yet set in the build environment.
 */
export function getRazorpay(): Razorpay {
  const key_id = process.env.RAZORPAY_KEY_ID
  const key_secret = process.env.RAZORPAY_KEY_SECRET
  if (!key_id || !key_secret) {
    throw new Error("[Razorpay] RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in environment variables.")
  }
  return new Razorpay({ key_id, key_secret })
}

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
