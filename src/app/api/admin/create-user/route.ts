import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import { adminAuth } from "@/lib/firebase/admin"
import { assertAdmin } from "@/lib/admin"
import { sendEmployerOnboardingWhatsApp, sendSeekerWelcomeWhatsApp } from "@/lib/whatsapp"
import { sendEmployerWelcomeEmail, sendSeekerWelcomeEmail } from "@/lib/email"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    if (!await assertAdmin()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const { role, phone, email } = body
    if (!role || !phone) return NextResponse.json({ error: "Missing required fields" }, { status: 400 })

    const formattedPhone = `+91${phone}`

    // 1. Get or Create Firebase User
    let firebaseUid: string
    try {
      const fbUser = await adminAuth.getUserByPhoneNumber(formattedPhone)
      firebaseUid = fbUser.uid
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        const newUser = await adminAuth.createUser({ phoneNumber: formattedPhone })
        firebaseUid = newUser.uid
      } else {
        throw err
      }
    }

    // 2. Check if user already exists in DB
    const existingUser = await prisma.user.findUnique({ where: { id: firebaseUid } })
    if (existingUser) {
      if (existingUser.role !== role) {
        return NextResponse.json(
          { error: `Phone number is already registered as a ${existingUser.role}. Cannot create as ${role}.` },
          { status: 409 }
        )
      }
      // If role matches, we might just need to create or update the profile
    }

    // 3. Upsert User in DB
    const dbUser = await prisma.user.upsert({
      where: { id: firebaseUid },
      create: {
        id: firebaseUid,
        phone: formattedPhone,
        email: email || null,
        role: role as "SEEKER" | "EMPLOYER",
        emailVerified: false,
      },
      // Only fill in an email that was missing; never overwrite an existing one.
      update: email ? { email } : {},
    })

    // 4. Create Profile
    if (role === "EMPLOYER") {
      const { companyName, contactPerson, city, industry } = body
      if (!companyName) return NextResponse.json({ error: "Company name required" }, { status: 400 })

      await prisma.employerProfile.upsert({
        where: { userId: firebaseUid },
        create: {
          userId: firebaseUid,
          companyName,
          contactPerson,
          contactPhone: phone, // Store without +91 as per normal flow
          city,
          industry,
          status: "VERIFIED", // Admin created employers are automatically verified
        },
        update: {
          companyName,
          contactPerson,
          city,
          industry,
        },
      })
    } else if (role === "SEEKER") {
      const { name, city, experienceMin, skills } = body
      if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 })

      await prisma.seekerProfile.upsert({
        where: { userId: firebaseUid },
        create: {
          userId: firebaseUid,
          name,
          city,
          experienceYears: experienceMin ? parseInt(experienceMin) : 0,
          skills: skills ? skills.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
          isProfileComplete: true,
        },
        update: {
          name,
          city,
          experienceYears: experienceMin ? parseInt(experienceMin) : undefined,
          skills: skills ? skills.split(",").map((s: string) => s.trim()).filter(Boolean) : undefined,
        },
      })
    }

    // Tell them the account exists.
    //
    // Nothing was sent here before, so an employer signed up in the field
    // walked away with a working account they had no idea about and no
    // instruction to sign in with their number. Only send on first creation —
    // re-saving an existing user must not re-welcome them.
    if (!existingUser) {
      void (async () => {
        try {
          if (role === "EMPLOYER") {
            const { companyName, contactPerson } = body
            const wa = await sendEmployerOnboardingWhatsApp(
              formattedPhone,
              contactPerson || companyName,
              companyName
            )
            if (!wa.ok) console.error("[admin/create-user] employer WhatsApp failed:", wa.error)
            if (email) await sendEmployerWelcomeEmail({ email, companyName })
          } else {
            const { name } = body
            const wa = await sendSeekerWelcomeWhatsApp(formattedPhone, name)
            if (!wa.ok) console.error("[admin/create-user] seeker WhatsApp failed:", wa.error)
            if (email) await sendSeekerWelcomeEmail({ email, name })
          }
        } catch (err) {
          console.error("[admin/create-user] welcome notification failed:", err)
        }
      })()
    }

    return NextResponse.json({ success: true, uid: firebaseUid })
  } catch (error: any) {
    console.error("Admin create user error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create user" },
      { status: 500 }
    )
  }
}
