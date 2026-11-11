import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

/**
 * Skill autocomplete.
 *
 * Public on purpose: it is a fixed vocabulary with nothing user-specific in
 * it, and keeping it unauthenticated means the mobile app can call it from the
 * profile screen without a token in hand.
 *
 * ?q=          what the user has typed so far; omit for the starter list
 * ?category=   a Category slug to prefer, e.g. the seeker's chosen category
 * ?limit=      default 10, capped at 50
 */

type Row = {
  slug: string
  nameEn: string
  nameHi: string | null
  categorySlugs: string[]
  aliases: string[]
  sortOrder: number
}

// The table is ~120 fixed rows, so it is held in memory and filtered here
// rather than queried per keystroke. Substring matching across both names and
// aliases is the point — Postgres array containment only matches whole
// elements, so "bike" would never find the alias list it lives in.
let cache: { rows: Row[]; at: number } | null = null
const TTL_MS = 10 * 60 * 1000

async function allSkills(): Promise<Row[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.rows
  const rows = await prisma.skill.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { slug: true, nameEn: true, nameHi: true, categorySlugs: true, aliases: true, sortOrder: true },
  })
  cache = { rows, at: Date.now() }
  return rows
}

/** Lower is better. Returns null when the row does not match at all. */
function rank(row: Row, q: string): number | null {
  if (!q) return 0
  const name = row.nameEn.toLowerCase()
  if (name.startsWith(q)) return 0
  if (row.aliases.some((a) => a.toLowerCase().startsWith(q))) return 1
  if (name.includes(q)) return 2
  if (row.aliases.some((a) => a.toLowerCase().includes(q))) return 3
  if (row.nameHi && row.nameHi.includes(q)) return 3
  return null
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const q = (searchParams.get("q") ?? "").trim().toLowerCase()
  const category = searchParams.get("category")?.trim() || null
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10") || 10))

  let rows: Row[]
  try {
    rows = await allSkills()
  } catch (err) {
    // Before the seed has run this table is empty rather than missing, but a
    // failure here must not take the profile form down with it — the caller
    // falls back to free text.
    console.error("[api/skills] lookup failed:", err)
    return NextResponse.json({ skills: [] })
  }

  const scored: { row: Row; score: number }[] = []
  for (const row of rows) {
    const r = rank(row, q)
    if (r === null) continue
    // A skill in the seeker's own category sorts above an equally good match
    // from an unrelated trade.
    scored.push({ row, score: r * 10 + (category && row.categorySlugs.includes(category) ? 0 : 1) })
  }

  scored.sort((a, b) => a.score - b.score || a.row.sortOrder - b.row.sortOrder)

  return NextResponse.json({
    skills: scored.slice(0, limit).map(({ row }) => ({
      slug: row.slug,
      name: row.nameEn,
      nameHi: row.nameHi,
      categories: row.categorySlugs,
    })),
  })
}
