import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import { getPlanLimits } from "@/lib/subscription"
import { emailVerificationBlock } from "@/lib/employerAuth"
import { sendSeekerContactUnlockedWhatsApp } from "@/lib/whatsapp"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id: seekerId } = await params

    const employer = await prisma.employerProfile.findUnique({ where: { userId: session.uid } })
    if (!employer) return NextResponse.json({ error: "Employer not found" }, { status: 404 })

    // Contact details only go to verified businesses. Without this check any
    // signup can read every seeker phone number and email, because the free
    // plan is granted automatically and its unlock credits never run out.
    if (employer.status !== "VERIFIED") {
      return NextResponse.json(
        {
          // Mobile shows `error` to the user verbatim (apiErrorMessage in
          // jobs24Mobile/src/lib/api.ts), so it carries the sentence and the
          // machine-readable string moves to `code`. `message` is kept for any
          // caller still reading the old shape.
          error: "Your company must be verified before you can unlock candidate contact details.",
          code: "VERIFICATION_REQUIRED",
          message: "Your company must be verified before you can unlock candidate contact details.",
        },
        { status: 403 }
      )
    }

    // A password account that never confirmed its address is one password
    // reset away from belonging to whoever owns that mailbox, so it does not
    // reach contact details either — even once the company is VERIFIED.
    const emailError = await emailVerificationBlock(session)
    if (emailError) {
      return NextResponse.json(
        { error: emailError, code: "EMAIL_VERIFICATION_REQUIRED", message: emailError },
        { status: 403 }
      )
    }

    // Already unlocked by this employer?
    const existing = await prisma.candidateUnlock.findUnique({
      where: { employerId_seekerId: { employerId: employer.id, seekerId } },
    })
    if (existing) {
      // Already unlocked — just return the contact info
      const seeker = await prisma.seekerProfile.findUnique({
        where: { id: seekerId },
        select: { name: true, user: { select: { phone: true, email: true } } },
      })
      return NextResponse.json({ success: true, contact: seeker?.user })
    }

    const limits = await getPlanLimits(employer.id)

    // Every employer has a subscription — the free launch plan if nothing
    // else — so this is purely a credit check. The free plan's credits are
    // effectively unlimited, which is what makes "Instant Candidate Unlocks"
    // on the plans page true.
    if (limits.unlocksLeft <= 0) {
      return NextResponse.json(
        {
          error: "You have used all your candidate unlock credits. Upgrade to unlock more.",
          code: "UPGRADE_REQUIRED",
          message: "You have used all your candidate unlock credits. Upgrade to unlock more.",
        },
        { status: 402 }
      )
    }

    const seeker = await prisma.seekerProfile.findUnique({
      where: { id: seekerId },
      select: { name: true, user: { select: { phone: true, email: true } } },
    })
    if (!seeker) return NextResponse.json({ error: "Seeker not found" }, { status: 404 })

    // Until now a seeker's phone number was handed to a company and the seeker
    // was told nothing at all. UTILITY, so it is not gated on marketing
    // consent — withholding "your number was just released" from someone who
    // declined job alerts would be withholding something they are owed.
    //
    // Fired only below, after a new unlock is recorded: the `existing` branch
    // returns early, so a company re-opening a contact it already paid for
    // does not re-notify.

    if (limits.sub) {
      const subscriptionId = limits.sub.id
      await prisma.$transaction([
        prisma.candidateUnlock.create({
          data: { employerId: employer.id, seekerId, subscriptionId },
        }),
        prisma.subscription.update({
          where: { id: subscriptionId },
          data: { candidateUnlocksUsed: { increment: 1 } },
        }),
      ])
    }

    if (seeker.user.phone) {
      void sendSeekerContactUnlockedWhatsApp(
        seeker.user.phone,
        seeker.name,
        employer.companyName
      )
    }

    return NextResponse.json({ success: true, contact: seeker.user })
  } catch (err) {
    console.error("[seeker/contact]", err)
    return NextResponse.json({ error: "Failed to unlock contact" }, { status: 500 })
  }
}
