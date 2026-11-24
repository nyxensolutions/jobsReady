import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { getServerSession } from "@/lib/firebase/session"
import { adminAuth } from "@/lib/firebase/admin"
import { prisma } from "@/lib/db"

/**
 * Records the phone number Firebase now holds for the signed-in account.
 *
 * Called after the client has completed `linkWithPhoneNumber`. The number is
 * read back from the Firebase user record rather than taken from the request
 * body or the session: the body is the caller's word for it, and the session
 * cookie was minted before the link, so it still carries no phone_number at
 * all. The user record is the only place that reflects what actually happened.
 *
 * Why this endpoint exists: seven accounts signed up with Google and have
 * users.phone = NULL. Google is their only credential. Signing in by phone
 * would mint a different Firebase uid and therefore a different, empty
 * account — so for them that is not recovery, it is losing everything. This
 * attaches a phone to the uid they already have.
 */
export async function POST() {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const fbUser = await adminAuth.getUser(session.uid).catch(() => null)
  if (!fbUser) return NextResponse.json({ error: "Account not found" }, { status: 404 })

  if (!fbUser.phoneNumber) {
    return NextResponse.json(
      {
        error: "The mobile number was not linked. Please request the code again.",
        code: "LINK_INCOMPLETE",
      },
      { status: 400 }
    )
  }

  try {
    await prisma.user.update({
      where: { id: session.uid },
      data: { phone: fbUser.phoneNumber },
    })
  } catch (err) {
    // users.phone is unique. The check endpoint runs before the OTP precisely
    // so this is close to unreachable, but two people can link the same number
    // in the window between check and confirm, and the loser must be told
    // rather than handed a 500.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json(
        {
          error: "That mobile number was just claimed by another account.",
          code: "PHONE_TAKEN",
        },
        { status: 409 }
      )
    }
    console.error("[auth/link-phone]", err)
    return NextResponse.json({ error: "Could not save your mobile number." }, { status: 500 })
  }

  return NextResponse.json({ success: true, phone: fbUser.phoneNumber })
}
