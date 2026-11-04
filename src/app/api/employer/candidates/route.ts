import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import { searchCandidates } from "@/lib/candidateQuery"

export async function GET(req: NextRequest) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const dbUser = await prisma.user.findUnique({ where: { id: session.uid } })
  if (!dbUser || dbUser.role !== "EMPLOYER") return NextResponse.json({ error: "Employers only" }, { status: 403 })

  const { searchParams } = req.nextUrl
  const minExpRaw = searchParams.get("minExp")

  const result = await searchCandidates(
    {
      city: searchParams.get("city")?.trim() || undefined,
      category: searchParams.get("category")?.trim() || undefined,
      keyword: searchParams.get("q")?.trim() || undefined,
      language: searchParams.get("language")?.trim() || undefined,
      minExp: minExpRaw ? parseInt(minExpRaw) : undefined,
    },
    Math.max(1, parseInt(searchParams.get("page") ?? "1"))
  )

  // `candidates` stays truthful: when a category matched nobody it is empty,
  // and the relaxed set rides along in `suggested`. The mobile client reads
  // only `candidates`, so it keeps showing its empty state instead of
  // presenting unrelated people as matches.
  return NextResponse.json(result)
}
