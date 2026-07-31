import { config } from "dotenv"
config({ path: ".env.local" })

import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { generateJobDescription } from "./generate-description"

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const APP_ID = process.env.ADZUNA_APP_ID!
const APP_KEY = process.env.ADZUNA_APP_KEY!
const BASE = "https://api.adzuna.com/v1/api/jobs/in/search/1"

// Each entry = one API call. Keep total ≤ 8/day to stay within 250/month free tier.
// Using broader locations (delhi / noida / gurgaon) and alternate job titles for better coverage.
const SEARCHES = [
  { what: "delivery boy courier executive", where: "delhi", category: "delivery" },
  { what: "driver cab tempo auto", where: "delhi", category: "driver" },
  { what: "security guard watchman chowkidar", where: "delhi", category: "security" },
  { what: "helper peon attendant loader", where: "delhi", category: "fieldWork" },
  { what: "cook chef kitchen canteen", where: "delhi", category: "cook" },
  { what: "factory worker operator packing labour", where: "noida", category: "factory" },
  { what: "housekeeping cleaner sweeper sanitation", where: "gurgaon", category: "housekeeping" },
  { what: "electrician plumber carpenter painter mason", where: "delhi", category: "construction" },
  { what: "sales executive telecaller retail cashier", where: "delhi", category: "sales" },
  { what: "warehouse store keeper inventory", where: "noida", category: "factory" },
]

const CITY_SLUG: Record<string, string> = {
  delhi: "delhi", "new delhi": "delhi", noida: "noida",
  gurgaon: "gurgaon", gurugram: "gurgaon", faridabad: "faridabad",
  ghaziabad: "ghaziabad", meerut: "meerut", hapur: "hapur",
  "greater noida": "greater-noida",
}

const CATEGORY_OVERRIDE: Record<string, string> = {
  delivery: "delivery", driver: "driver", security: "security",
  cook: "cook", factory: "factory", housekeeping: "housekeeping",
  construction: "construction", sales: "sales",
}

const CAT_KEYWORDS: [string, string][] = [
  ["deliver", "delivery"], ["courier", "delivery"], ["logistic", "delivery"],
  ["driver", "driver"], ["cab", "driver"], ["tempo", "driver"], ["transport", "driver"],
  ["security", "security"], ["guard", "security"],
  ["cook", "cook"], ["chef", "cook"], ["kitchen", "cook"],
  ["factory", "factory"], ["manufactur", "factory"], ["machine operator", "factory"], ["packing", "factory"],
  ["housekeep", "housekeeping"], ["cleaning", "housekeeping"], ["sweeper", "housekeeping"],
  ["mason", "construction"], ["electrician", "construction"], ["plumber", "construction"], ["construction", "construction"],
  ["retail", "retail"], ["cashier", "retail"], ["shopkeeper", "retail"],
  ["sales", "sales"], ["telecaller", "sales"],
  ["healthcare", "healthcare"], ["nurse", "healthcare"],
  ["it support", "it"], ["computer", "it"],
]

function guessCategory(title: string, hint: string): string {
  if (CATEGORY_OVERRIDE[hint]) return CATEGORY_OVERRIDE[hint]
  const text = title.toLowerCase()
  for (const [kw, slug] of CAT_KEYWORDS) {
    if (text.includes(kw)) return slug
  }
  return "fieldWork"
}

function resolveCitySlug(locationStr: string): string {
  const lower = locationStr.toLowerCase()
  for (const [key, slug] of Object.entries(CITY_SLUG)) {
    if (lower.includes(key)) return slug
  }
  return "delhi"
}

function parseJobType(contractTime?: string, contractType?: string): "FULL_TIME" | "PART_TIME" | "CONTRACT" | "GIG" {
  const t = ((contractTime ?? "") + " " + (contractType ?? "")).toLowerCase()
  if (t.includes("part")) return "PART_TIME"
  if (t.includes("contract") || t.includes("temp")) return "CONTRACT"
  return "FULL_TIME"
}

interface AdzunaJob {
  id: string
  title: string
  description: string
  redirect_url: string
  location?: { display_name?: string; area?: string[] }
  salary_min?: number
  salary_max?: number
  contract_time?: string
  contract_type?: string
  company?: { display_name?: string }
  created?: string
  category?: { label?: string; tag?: string }
}

async function fetchAdzunaJobs(what: string, where: string): Promise<AdzunaJob[]> {
  const params = new URLSearchParams({
    app_id: APP_ID,
    app_key: APP_KEY,
    results_per_page: "50",
    what,
    where,
    "content-type": "application/json",
  })

  const res = await fetch(`${BASE}?${params}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(15_000),
  })

  if (!res.ok) {
    console.warn(`  Adzuna HTTP ${res.status} for "${what}" in "${where}"`)
    return []
  }

  const data = await res.json()
  return (data?.results ?? []) as AdzunaJob[]
}

export async function scrapeAdzuna(
  employerId: string,
): Promise<{ inserted: number; skipped: number; errors: number }> {
  const stats = { inserted: 0, skipped: 0, errors: 0 }

  if (!APP_ID || !APP_KEY) {
    console.warn("  Adzuna: ADZUNA_APP_ID / ADZUNA_APP_KEY not set — skipping")
    return stats
  }

  const [allCities, allCategories] = await Promise.all([
    prisma.city.findMany({ select: { id: true, slug: true } }),
    prisma.category.findMany({ select: { id: true, slug: true } }),
  ])
  const cityIndex = Object.fromEntries(allCities.map((c) => [c.slug, c.id]))
  const catIndex = Object.fromEntries(allCategories.map((c) => [c.slug, c.id]))

  for (const search of SEARCHES) {
    console.log(`  Searching: "${search.what}" in "${search.where}"`)

    let jobs: AdzunaJob[]
    try {
      jobs = await fetchAdzunaJobs(search.what, search.where)
    } catch (err) {
      console.error(`  ✗ Fetch error:`, err)
      stats.errors++
      continue
    }

    console.log(`    → ${jobs.length} results`)

    for (const job of jobs) {
      try {
        const sourceUrl = job.redirect_url
        if (!sourceUrl) { stats.skipped++; continue }

        // Dedup — skip if already in DB
        const existing = await prisma.jobListing.findFirst({ where: { sourceUrl }, select: { id: true } })
        if (existing) { stats.skipped++; continue }

        // Resolve city
        const locationStr = job.location?.display_name ?? job.location?.area?.join(" ") ?? ""
        const citySlug = resolveCitySlug(locationStr)
        const cityId = cityIndex[citySlug] ?? cityIndex["delhi"]
        if (!cityId) { stats.errors++; continue }

        // Resolve category
        const catSlug = guessCategory(job.title, search.category)
        const categoryId = catIndex[catSlug] ?? catIndex["fieldWork"]
        if (!categoryId) { stats.errors++; continue }

        // Salary — Adzuna returns annual figures for India; convert to monthly
        const salaryMin = job.salary_min ? Math.round(job.salary_min / 12) : undefined
        const salaryMax = job.salary_max ? Math.round(job.salary_max / 12) : undefined

        const jobType = parseJobType(job.contract_time, job.contract_type)

        // Generate original description — never store Adzuna's text verbatim
        const description = generateJobDescription({
          title: job.title,
          city: locationStr || "Delhi NCR",
          salaryMin,
          salaryMax,
          salaryUnit: "monthly",
          category: catSlug,
          jobType,
        })

        await prisma.jobListing.create({
          data: {
            employerId,
            categoryId,
            cityId,
            title: job.title,
            description,
            salaryMin,
            salaryMax,
            salaryUnit: "monthly",
            vacancies: 1,
            jobType,
            experienceMin: 0,
            status: "PENDING_REVIEW",
            source: "SCRAPED",
            sourceUrl,
            lastScrapedAt: new Date(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        })

        stats.inserted++
        console.log(`    ✓ ${job.title} (${citySlug})`)
      } catch (err) {
        console.error(`    ✗ Error on job ${job.id}:`, err)
        stats.errors++
      }
    }

    // Polite delay between API calls
    await new Promise((r) => setTimeout(r, 1000))
  }

  return stats
}
