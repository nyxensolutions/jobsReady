import type { DecodedIdToken } from "firebase-admin/auth"
import { prisma } from "./db"

/** Firebase records which credential minted the token. */
function isPasswordAccount(session: DecodedIdToken): boolean {
  return session.firebase?.sign_in_provider === "password"
}

/**
 * A user-facing sentence when a password-based employer has not yet proved it
 * owns its email address, or null when the account is clear to act.
 *
 * Only password accounts are gated. Phone employers may legitimately hold no
 * email at all, and Google tokens arrive with the address already verified, so
 * neither is affected — adding this check cannot lock out anyone who signed up
 * before passwords existed.
 *
 * Why the gate exists: Firebase mails a password reset to whatever address was
 * typed at signup. If that address was never confirmed, whoever really owns the
 * mailbox can reset the password and walk into the account, taking its VERIFIED
 * employer status and with it access to every seeker's contact details.
 */
export async function emailVerificationBlock(session: DecodedIdToken): Promise<string | null> {
  if (!isPasswordAccount(session)) return null

  const user = await prisma.user.findUnique({
    where: { id: session.uid },
    select: { emailVerified: true },
  })
  if (user?.emailVerified) return null

  // Deliberately does not claim a code was sent: nothing here sends one, and
  // an account can reach this state without ever having been mailed. It names
  // the place that can send one instead.
  return "Please confirm your email address before continuing. Open your company profile and use Sign-in methods to send yourself a code."
}
