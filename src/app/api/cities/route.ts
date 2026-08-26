import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// GET /api/cities — for filter pickers. Public, no auth required.
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
