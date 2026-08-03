import { config } from "dotenv"
config({ path: ".env.local" })

import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { generateJobDescription } from "./generate-description"

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY
const BASE = "https://jsearch.p.rapidapi.com/search-v2"

// Each entry = one API call. Free tier = 200 req/month, so keep total ≤ 6/day.
// JSearch query format: "job title in city, country"
const SEARCHES = [
  { query: "delivery boy courier executive in Delhi India", category: "delivery" },
  { query: "security guard officer in Delhi NCR India", category: "security" },
  { query: "driver cab auto in Delhi NCR India", category: "driver" },
  { query: "cook chef kitchen helper in Delhi India", category: "cook" },
  { query: "packing operator production worker in Noida India", category: "factory" },
  { query: "housekeeping staff cleaning in Gurgaon India", category: "housekeeping" },
]

const CITY_SLUG: Record<string, string> = {
  delhi: "delhi", "new delhi": "delhi", noida: "noida",
  gurgaon: "gurgaon", gurugram: "gurgaon", faridabad: "faridabad",
  ghaziabad: "ghaziabad", meerut: "meerut", hapur: "hapur",
  "greater noida": "greater-noida",
}

const CAT_KEYWORDS: [string, string][] = [
  ["deliver", "delivery"], ["courier", "delivery"], ["logistic", "delivery"],
  ["driver", "driver"], ["cab", "driver"], ["chauffeur", "driver"],
  ["security", "security"], ["guard", "security"], ["watchman", "security"],
  ["cook", "cook"], ["chef", "cook"], ["kitchen", "cook"],
  ["factory", "factory"], ["manufactur", "factory"], ["packing", "factory"], ["operator", "factory"],
  ["housekeep", "housekeeping"], ["cleaning", "housekeeping"], ["sweeper", "housekeeping"],
  ["mason", "construction"], ["electrician", "construction"], ["plumber", "construction"],
  ["retail", "retail"], ["cashier", "retail"],
  ["sales", "sales"], ["telecaller", "sales"],
]

function guessCategory(title: string, hint: string): string {
  const cat = hint.toLowerCase()
  if (["delivery","driver","security","cook","factory","housekeeping","construction","retail","sales"].includes(cat)) return cat
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
  // Default to delhi if we can't resolve — all our searches are Delhi NCR
  return "delhi"
}

function parseJobType(title: string, desc: string): "FULL_TIME" | "PART_TIME" | "CONTRACT" | "GIG" {
  const text = (title + " " + desc).toLowerCase()
  if (text.includes("part time") || text.includes("part-time")) return "PART_TIME"
  if (text.includes("contract") || text.includes("temporary") || text.includes("temp ")) return "CONTRACT"
  if (text.includes("daily wage") || text.includes("gig") || text.includes("freelance")) return "GIG"
  return "FULL_TIME"
}

interface JSearchJob {
  job_id: string
  job_title: string
  job_description: string
  job_apply_link: string
  job_city?: string
  job_state?: string
  job_country?: string
  job_min_salary?: number
  job_max_salary?: number
  job_salary_period?: string
  job_employment_type?: string
  employer_name?: string
  job_posted_at_timestamp?: number
}

async function fetchJSearchJobs(query: string): Promise<JSearchJob[]> {
  const params = new URLSearchParams({
    query,
    page: "1",
    num_pages: "1",
    date_posted: "week",         // fresh jobs only
    country: "in",
    language: "en",
  })

  const res = await fetch(`${BASE}?${params}`, {
    headers: {
      "X-RapidAPI-Key": RAPIDAPI_KEY!,
      "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
    },
    signal: AbortSignal.timeout(15_000),
  })

  if (!res.ok) {
    console.warn(`  JSearch HTTP ${res.status} for "${query}"`)
    return []
  }

  const data = await res.json()
  return (data?.data?.jobs ?? data?.data ?? []) as JSearchJob[]
}

function normaliseSalary(amount: number | undefined, period: string | undefined): number | undefined {
  if (!amount) return undefined
  const p = (period ?? "").toLowerCase()
  // JSearch returns annual for India most of the time; convert to monthly
  if (p.includes("year") || p.includes("annual") || p === "yearly") return Math.round(amount / 12)
  if (p.includes("month")) return Math.round(amount)
  if (p.includes("week")) return Math.round(amount * 4)
  if (p.includes("day") || p.includes("hour")) return undefined // too granular, skip
  // Default: assume annual if > 50,000 (monthly salaries in India rarely exceed that)
  return amount > 50_000 ? Math.round(amount / 12) : Math.round(amount)
}

export async function scrapeJSearch(
  employerId: string,
): Promise<{ inserted: number; skipped: number; errors: number }> {
  const stats = { inserted: 0, skipped: 0, errors: 0 }

  if (!RAPIDAPI_KEY) {
    console.warn("  JSearch: RAPIDAPI_KEY not set — skipping")
    return stats
  }

  const [allCities, allCategories] = await Promise.all([
    prisma.city.findMany({ select: { id: true, slug: true } }),
    prisma.category.findMany({ select: { id: true, slug: true } }),
  ])
  const cityIndex = Object.fromEntries(allCities.map((c) => [c.slug, c.id]))
  const catIndex = Object.fromEntries(allCategories.map((c) => [c.slug, c.id]))

  for (const search of SEARCHES) {
    console.log(`  Searching: "${search.query}"`)

    let jobs: JSearchJob[]
    try {
      jobs = await fetchJSearchJobs(search.query)
    } catch (err) {
      console.error(`  ✗ Fetch error:`, err)
      stats.errors++
      continue
    }

    console.log(`    → ${jobs.length} results`)

    for (const job of jobs) {
      try {
        const sourceUrl = job.job_apply_link
        if (!sourceUrl) { stats.skipped++; continue }

        // Dedup by sourceUrl
        const existing = await prisma.jobListing.findFirst({ where: { sourceUrl }, select: { id: true } })
        if (existing) { stats.skipped++; continue }

        // Filter to India only (JSearch can return global results for broad queries)
        const country = (job.job_country ?? "").toLowerCase()
        if (country && !["india", "in"].includes(country)) { stats.skipped++; continue }

        // Resolve city
        const locationStr = [job.job_city, job.job_state].filter(Boolean).join(" ")
        const citySlug = resolveCitySlug(locationStr || "delhi")
        const cityId = cityIndex[citySlug] ?? cityIndex["delhi"]
        if (!cityId) { stats.errors++; continue }

        // Resolve category
        const catSlug = guessCategory(job.job_title, search.category)
        const categoryId = catIndex[catSlug] ?? catIndex["fieldWork"]
        if (!categoryId) { stats.errors++; continue }

        // Salary
        const salaryMin = normaliseSalary(job.job_min_salary, job.job_salary_period)
        const salaryMax = normaliseSalary(job.job_max_salary, job.job_salary_period)

        const jobType = parseJobType(job.job_title, job.job_description ?? "")

        // Generate fresh description — never store JSearch/source text verbatim
        const description = generateJobDescription({
          title: job.job_title,
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
            title: job.job_title,
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
        console.log(`    ✓ ${job.job_title} (${citySlug})`)
      } catch (err) {
        console.error(`    ✗ Error on job ${job.job_id}:`, err)
        stats.errors++
      }
    }

    // Polite delay between API calls (also helps with rate limits)
    await new Promise((r) => setTimeout(r, 1500))
  }

  return stats
}
