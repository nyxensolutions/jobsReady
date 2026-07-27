import { prisma } from "@/lib/db"

export async function otpSet(phone: string, otp: string, ttlMs = 10 * 60 * 1000) {
  await prisma.otpCode.upsert({
    where: { phone },
    update: { otp, expiresAt: new Date(Date.now() + ttlMs) },
    create: { phone, otp, expiresAt: new Date(Date.now() + ttlMs) },
  })
}

export async function otpGet(phone: string) {
  const record = await prisma.otpCode.findUnique({ where: { phone } })
  if (!record) return null
  return { otp: record.otp, expiresAt: record.expiresAt.getTime() }
}

export async function otpDelete(phone: string) {
  await prisma.otpCode.delete({ where: { phone } }).catch(() => {})
}
