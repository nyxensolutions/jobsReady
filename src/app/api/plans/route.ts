import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

/**
 * Public plan catalogue.
 *
 * Both the web plans page and the mobile app previously hardcoded their own
 * three-plan list — the same invented names on each ("Starter", "Growth",
 * "Scale") and none of them matching the rows in this table. Harmless while
 * checkout is disabled, but it means the prices on screen are not the prices
 * anyone would be charged.
 *
 * Cashfree's create-order takes a plan slug, so this returns the slug a
 * caller needs to start a real checkout once billing is switched on.
 */
export async function GET() {
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { priceRupees: "asc" }],
    select: {
      slug: true,
      name: true,
      type: true,
      durationDays: true,
      priceRupees: true,
      activeJobLimit: true,
      candidateUnlockCredits: true,
      boostCredits: true,
      isPopular: true,
      isTrial: true,
    },
  })

  return NextResponse.json(plans)
}
