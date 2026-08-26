import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// GET /api/categories — for filter pickers. Public, no auth required.
export async function GET() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      slug: true,
      nameEn: true,
      nameHi: true,
      nameTe: true,
      nameTa: true,
      nameKn: true,
      nameBn: true,
      namePa: true,
      icon: true,
    },
  })
  return NextResponse.json(categories)
}
