import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// GET /api/cities — for filter pickers. Public, no auth required.
//
// Returns a bare array. The installed mobile app depends on that shape, so
// metro-area groupings live at /api/city-clusters rather than being folded in
// here, which would break every copy already on a handset.
export async function GET() {
  const cities = await prisma.city.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      nameHi: true,
      stateCode: true,
      stateName: true,
    },
  })
  return NextResponse.json(cities)
}
