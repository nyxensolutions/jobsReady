import { config } from "dotenv"
config({ path: ".env.local" })

import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { generateJobDescription } from "./generate-description"

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const NCS_BASE = "https://betacloud.ncs.gov.in/api/v1"

// NCS city label -> our city slug
const CITY_MAP: Record<string, string> = {
  Delhi: "delhi",
  "New Delhi": "delhi",
  Noida: "noida",
  Gurgaon: "gurgaon",
  Gurugram: "gurgaon",
  Faridabad: "faridabad",
  Ghaziabad: "ghaziabad",
  Meerut: "meerut",
  Hapur: "hapur",
  "Greater Noida": "greater-noida",
}

// NCS functional-area keyword -> our category slug
const CATEGORY_KEYWORDS: [string, string][] = [
  ["delivery", "delivery"],
  ["courier", "delivery"],
  ["logistics", "delivery"],
  ["driver", "driver"],
  ["transport", "driver"],
  ["security", "security"],
  ["guard", "security"],
  ["housekeep", "housekeeping"],
  ["cleaning", "housekeeping"],
  ["sweeper", "housekeeping"],
  ["cook", "cook"],
  ["chef", "cook"],
  ["kitchen", "cook"],
  ["construction", "construction"],
  ["mason", "construction"],
  ["plumber", "construction"],
  ["electrician", "construction"],
  ["welder", "construction"],
  ["factory", "factory"],
  ["manufactur", "factory"],
  ["assembl", "factory"],
  ["production", "factory"],
  ["retail", "retail"],
  ["shop", "retail"],
  ["cashier", "retail"],
  ["sales", "sales"],
  ["field", "fieldWork"],
  ["healthcare", "healthcare"],
  ["nurse", "healthcare"],
  ["hospital", "healthcare"],
  ["it ", "it"],
  ["computer", "it"],
  ["software", "it"],
]

function mapCategory(text: string): string {
  const lower = text.toLowerCase()
  for (const [keyword, slug] of CATEGORY_KEYWORDS) {
    if (lower.includes(keyword)) return slug
  }
  return "fieldWork"
}

function mapJobType(text: string): "FULL_TIME" | "PART_TIME" | "CONTRACT" | "GIG" {
  const lower = text.toLowerCase()
  if (lower.includes("part")) return "PART_TIME"
  if (lower.includes("contract") || lower.includes("freelance")) return "CONTRACT"
  if (lower.includes("gig") || lower.includes("daily")) return "GIG"
  return "FULL_TIME"
}

function parseSalary(raw: string | number | undefined): { min?: number; max?: number; unit: string } {
  if (!raw) return { unit: "monthly" }
  const s = String(raw).replace(/,/g, "")
  const nums = [...s.matchAll(/\d+/g)].map((m) => parseInt(m[0]))
  if (!nums.length) return { unit: "monthly" }
  const unit = s.toLowerCase().includes("day") || s.toLowerCase().includes("daily") ? "daily" : "monthly"
  return { min: nums[0], max: nums[1], unit }
}

interface NcsJob {
  id?: string | number
  jobId?: string | number
  postId?: string | number
  title?: string
  postTitle?: string
  designation?: string
  organization?: string
  companyName?: string
  location?: string
  city?: string
  cityName?: string
  salary?: string | number
  salaryMin?: number
  salaryMax?: number
  minSalary?: number
  maxSalary?: number
  qualification?: string
  educationalQualification?: string
  experience?: string | number
  minExperience?: number
  vacancies?: number
  numberOfVacancies?: number
  functionalArea?: string
  category?: string
  jobNature?: string
  jobType?: string
  lastDate?: string
  closingDate?: string
  description?: string
  jobDescription?: string
}

async function fetchNcsJobs(): Promise<NcsJob[]> {
  const delhiNcrCities = ["Delhi", "New Delhi", "Noida", "Gurgaon", "Gurugram", "Faridabad", "Ghaziabad", "Meerut", "Hapur", "Greater Noida"]

  const headers: Record<string, string> = {
    Accept: "application/json, text/plain, */*",
    "Accept-Language": "en-IN,en;q=0.9",
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (compatible; JobsReadyBot/1.0)",
    Origin: "https://www.ncs.gov.in",
    Referer: "https://www.ncs.gov.in/",
  }

  // Candidate endpoint patterns — try each until one yields data
  const strategies = [
    // Spring Boot pagination pattern
    async () => {
      const body = { city: delhiNcrCities, pageNo: 0, pageSize: 50, sortBy: "createdDate", sortDir: "desc" }
      const r = await fetch(`${NCS_BASE}/job-posts`, { method: "POST", headers, body: JSON.stringify(body) })
      if (!r.ok) return null
      const data = await r.json()
      return data?.content ?? data?.jobs ?? data?.data ?? (Array.isArray(data) ? data : null)
    },
    // Search endpoint
    async () => {
      const body = { cities: delhiNcrCities, page: 0, size: 50 }
      const r = await fetch(`${NCS_BASE}/job-posts/search`, { method: "POST", headers, body: JSON.stringify(body) })
      if (!r.ok) return null
      const data = await r.json()
      return data?.content ?? data?.jobs ?? data?.data ?? (Array.isArray(data) ? data : null)
    },
    // Filter-based search
    async () => {
      const body = { filters: { cities: delhiNcrCities }, pagination: { pageNo: 0, pageSize: 50 } }
      const r = await fetch(`${NCS_BASE}/job-posts/filter`, { method: "POST", headers, body: JSON.stringify(body) })
      if (!r.ok) return null
      const data = await r.json()
      return data?.content ?? data?.jobs ?? data?.data ?? (Array.isArray(data) ? data : null)
    },
    // GET with query params (fallback)
    async () => {
      const params = new URLSearchParams({ city: "Delhi", page: "0", size: "50" })
      const r = await fetch(`${NCS_BASE}/job-posts?${params}`, { headers })
      if (!r.ok) return null
      const data = await r.json()
      return data?.content ?? data?.jobs ?? data?.data ?? (Array.isArray(data) ? data : null)
    },
  ]

  for (const strategy of strategies) {
    try {
      const jobs = await strategy()
      if (Array.isArray(jobs) && jobs.length > 0) {
        console.log(`  NCS: fetched ${jobs.length} jobs`)
        return jobs
      }
    } catch {
      // try next strategy
    }
  }

  console.warn("  NCS: all endpoint strategies failed or returned empty results")
  return []
}

export async function scrapeNcs(employerId: string): Promise<{ inserted: number; skipped: number; errors: number }> {
  const stats = { inserted: 0, skipped: 0, errors: 0 }

  // Fetch city and category lookups once
  const [allCities, allCategories] = await Promise.all([
    prisma.city.findMany({ select: { id: true, slug: true } }),
    prisma.category.findMany({ select: { id: true, slug: true } }),
  ])

  const cityIndex = Object.fromEntries(allCities.map((c) => [c.slug, c.id]))
  const catIndex = Object.fromEntries(allCategories.map((c) => [c.slug, c.id]))

  const rawJobs = await fetchNcsJobs()

  for (const job of rawJobs) {
    try {
      // Build canonical source URL for deduplication
      const rawId = job.id ?? job.jobId ?? job.postId
      if (!rawId) { stats.skipped++; continue }
      const sourceUrl = `https://www.ncs.gov.in/pages/en/Job-Seeker/job-details.aspx?jobId=${rawId}`

      // Skip if already in DB
      const existing = await prisma.jobListing.findFirst({ where: { sourceUrl }, select: { id: true } })
      if (existing) { stats.skipped++; continue }

      // Resolve city
      const rawCity = job.city ?? job.cityName ?? job.location ?? ""
      const citySlug = CITY_MAP[rawCity] ?? Object.keys(CITY_MAP).find((k) => rawCity.toLowerCase().includes(k.toLowerCase())) ? CITY_MAP[Object.keys(CITY_MAP).find((k) => rawCity.toLowerCase().includes(k.toLowerCase())) ?? ""] ?? "delhi" : "delhi"
      const cityId = cityIndex[citySlug] ?? cityIndex["delhi"]
      if (!cityId) { console.warn(`  No cityId for slug "${citySlug}"`); stats.errors++; continue }

      // Resolve category
      const catText = job.functionalArea ?? job.category ?? job.title ?? ""
      const catSlug = mapCategory(catText)
      const categoryId = catIndex[catSlug] ?? catIndex["fieldWork"]
      if (!categoryId) { console.warn(`  No categoryId for slug "${catSlug}"`); stats.errors++; continue }

      // Parse salary
      const rawSalary = job.salary ?? (job.salaryMin ? `${job.salaryMin}-${job.salaryMax}` : undefined) ?? (job.minSalary ? `${job.minSalary}-${job.maxSalary}` : undefined)
      const { min: salaryMin, max: salaryMax, unit: salaryUnit } = parseSalary(rawSalary)

      // Parse experience
      const expRaw = job.experience ?? job.minExperience ?? 0
      const experienceMin = typeof expRaw === "number" ? expRaw : parseInt(String(expRaw)) || 0

      // Parse vacancies
      const vacancies = job.vacancies ?? job.numberOfVacancies ?? 1

      // Job title
      const title = job.title ?? job.postTitle ?? job.designation ?? "General Worker"

      // Generate fresh description (never copy verbatim)
      const description = generateJobDescription({
        title,
        city: rawCity || "Delhi",
        salaryMin,
        salaryMax,
        salaryUnit,
        category: catSlug,
        jobType: mapJobType(job.jobNature ?? job.jobType ?? ""),
        experienceMin,
        qualificationRequired: job.qualification ?? job.educationalQualification,
      })

      // Parse expiry date
      const expiresAt = job.lastDate ?? job.closingDate
        ? new Date(job.lastDate ?? job.closingDate ?? "")
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

      await prisma.jobListing.create({
        data: {
          employerId,
          categoryId,
          cityId,
          title,
          description,
          salaryMin,
          salaryMax,
          salaryUnit,
          vacancies,
          jobType: mapJobType(job.jobNature ?? job.jobType ?? ""),
          experienceMin,
          qualificationRequired: job.qualification ?? job.educationalQualification,
          status: "PENDING_REVIEW",
          source: "SCRAPED",
          sourceUrl,
          lastScrapedAt: new Date(),
          expiresAt,
        },
      })

      stats.inserted++
      console.log(`  ✓ Inserted: ${title} (${rawCity})`)
    } catch (err) {
      console.error(`  ✗ Error processing job:`, err)
      stats.errors++
    }
  }

  return stats
}
