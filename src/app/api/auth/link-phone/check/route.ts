import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { adminAuth } from "@/lib/firebase/admin"
import { prisma } from "@/lib/db"

/**
 * Is this number free to attach to the signed-in account?
 *
 * Asked before the OTP is sent, never after. Linking in Firebase first and
 * finding the clash afterwards strands a phone credential on this account that
 * no `users` row will ever accept, and worse, it takes the number away from
 * the person who actually owns it: Firebase would then hold it against this
 * uid and refuse their sign-up forever. Same ordering, and the same reason, as
 * the password flow in EmployerSignInMethods.
 *
 * Both stores are checked. A number can exist in one and not the other — a
 * Firebase credential whose sign-up was refused leaves no row behind (see the
 * Google sign-up gate in api/auth/session), so Postgres alone would call it
 * free when it is not.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { phone } = await req.json().catch(() => ({}))
  if (typeof phone !== "string" || !/^[6-9]\d{9}$/.test(phone)) {
    return NextResponse.json(
      { error: "Enter a valid 10-digit Indian mobile number." },
      { status: 400 }
    )
  }

  // users.phone is stored E.164 throughout — every one of the 58 rows that has
  // a number is +91-prefixed, because it is written straight from Firebase's
  // phone_number claim. Matching on anything else would silently find nothing.
  const e164 = `+91${phone}`

  const owner = await prisma.user.findUnique({ where: { phone: e164 }, select: { id: true } })
  if (owner && owner.id !== session.uid) {
    return NextResponse.json(
      {
        error: "That mobile number already belongs to another Jobs24India account.",
        code: "PHONE_TAKEN",
      },
      { status: 409 }
    )
  }

  try {
    const fbUser = await adminAuth.getUserByPhoneNumber(e164)
    if (fbUser.uid !== session.uid) {
      return NextResponse.json(
        {
          error: "That mobile number is already registered. Sign in with it instead.",
          code: "PHONE_TAKEN",
        },
        { status: 409 }
      )
    }
  } catch (err) {
    // Not found is the good case: nobody holds the number.
    if ((err as { code?: string })?.code !== "auth/user-not-found") {
      console.error("[auth/link-phone/check]", err)
      return NextResponse.json({ error: "Could not check that number. Try again." }, { status: 500 })
    }
  }

  return NextResponse.json({ available: true })
}
