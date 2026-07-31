/**
 * Structured data scraper for sites that publish JSON-LD job postings.
 *
 * Usage: add URLs to URLS_TO_SCRAPE below (or pass them as CLI args).
 * Only use URLs from sites whose robots.txt permits scraping job listings.
 *
 * robots.txt references:
 *   - indeed.com: allows /viewjob paths for bots (verified 2024)
 *   - naukri.com:  allows job detail pages for crawlers (verified 2024)
 *   Always re-verify before adding a new domain.
 */
import { config } from "dotenv"
config({ path: ".env.local" })

import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { generateJobDescription } from "./generate-description"

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// ── Add job-detail page URLs here (one per line) ─────────────────────────────
// These must be individual job detail pages that publish JSON-LD JobPosting schema.
const URLS_TO_SCRAPE: string[] = [
  // Example — replace with real job-detail URLs before running:
  // "https://www.naukri.com/job-listings-delivery-boy-delhi-123456",
]
// ─────────────────────────────────────────────────────────────────────────────

const CITY_SLUG_MAP: Record<string, string> = {
  delhi: "delhi",
  "new delhi": "delhi",
  noida: "noida",
  gurgaon: "gurgaon",
  gurugram: "gurgaon",
  faridabad: "faridabad",
  ghaziabad: "ghaziabad",
  meerut: "meerut",
  hapur: "hapur",
  "greater noida": "greater-noida",
  mumbai: "mumbai",
  bengaluru: "bengaluru",
  bangalore: "bengaluru",
  hyderabad: "hyderabad",
  pune: "pune",
  kolkata: "kolkata",
  chennai: "chennai",
  ahmedabad: "ahmedabad",
  jaipur: "jaipur",
  lucknow: "lucknow",
  chandigarh: "chandigarh",
}

const CATEGORY_KEYWORDS: [string, string][] = [
  ["delivery", "delivery"],
  ["courier", "delivery"],
  ["driver", "driver"],
  ["security", "security"],
  ["guard", "security"],
  ["housekeep", "housekeeping"],
  ["cleaning", "housekeeping"],
  ["cook", "cook"],
  ["chef", "cook"],
  ["construction", "construction"],
  ["mason", "construction"],
  ["factory", "factory"],
  ["manufactur", "factory"],
  ["retail", "retail"],
  ["cashier", "retail"],
  ["sales", "sales"],
  ["healthcare", "healthcare"],
  ["nurse", "healthcare"],
  ["it ", "it"],
  ["software", "it"],
]

function guessCategorySlug(title: string, description: string): string {
  const text = (title + " " + description).toLowerCase()
  for (const [kw, slug] of CATEGORY_KEYWORDS) {
    if (text.includes(kw)) return slug
  }
  return "fieldWork"
}

interface JsonLdJobPosting {
  "@type"?: string
  title?: string
  hiringOrganization?: { name?: string }
  jobLocation?: { address?: { addressLocality?: string; addressRegion?: string } }
  baseSalary?: { value?: { minValue?: number; maxValue?: number; value?: number; unitText?: string } }
  experienceRequirements?: { monthsOfExperience?: number } | string
  educationRequirements?: { credentialCategory?: string } | string
  totalJobOpenings?: number
  employmentType?: string
  description?: string
  validThrough?: string
  url?: string
  identifier?: { value?: string }
}

async function fetchJsonLd(url: string): Promise<JsonLdJobPosting | null> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; JobsReadyBot/1.0; +https://jobsready.in/bot)",
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "en-IN,en;q=0.9",
    },
    signal: AbortSignal.timeout(15_000),
  })

  if (!res.ok) {
    console.warn(`  HTTP ${res.status} for ${url}`)
    return null
  }

  const html = await res.text()
  const scriptRe = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let match: RegExpExecArray | null

  while ((match = scriptRe.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1])
      const candidates = Array.isArray(parsed) ? parsed : [parsed]
      for (const item of candidates) {
        if (item?.["@type"] === "JobPosting") return item as JsonLdJobPosting
      }
    } catch {
      // malformed JSON-LD — skip
    }
  }

  return null
}

function extractCity(posting: JsonLdJobPosting): string {
  const raw = posting.jobLocation?.address?.addressLocality ?? ""
  return raw
}

function resolveCitySlug(cityName: string): string | null {
  const lower = cityName.toLowerCase().trim()
  return CITY_SLUG_MAP[lower] ?? null
}

function parseSalary(posting: JsonLdJobPosting): { min?: number; max?: number; unit: string } {
  const v = posting.baseSalary?.value
  if (!v) return { unit: "monthly" }
  const unit = v.unitText?.toLowerCase().includes("day") ? "daily" : "monthly"
  return { min: v.minValue ?? v.value, max: v.maxValue, unit }
}

function parseExperience(posting: JsonLdJobPosting): number {
  const exp = posting.experienceRequirements
  if (!exp) return 0
  if (typeof exp === "object" && "monthsOfExperience" in exp) {
    return Math.ceil((exp.monthsOfExperience ?? 0) / 12)
  }
  const match = String(exp).match(/(\d+)/)
  return match ? parseInt(match[1]) : 0
}

function parseJobType(posting: JsonLdJobPosting): "FULL_TIME" | "PART_TIME" | "CONTRACT" | "GIG" {
  const t = (posting.employmentType ?? "").toLowerCase()
  if (t.includes("part")) return "PART_TIME"
  if (t.includes("contract") || t.includes("temp")) return "CONTRACT"
  if (t.includes("gig") || t.includes("casual")) return "GIG"
  return "FULL_TIME"
}

function parseQualification(posting: JsonLdJobPosting): string | undefined {
  const eq = posting.educationRequirements
  if (!eq) return undefined
  if (typeof eq === "string") return eq
  return eq.credentialCategory
}

export async function scrapeStructured(
  employerId: string,
  urlsOverride?: string[],
): Promise<{ inserted: number; skipped: number; errors: number }> {
  const stats = { inserted: 0, skipped: 0, errors: 0 }
  const urls = urlsOverride ?? URLS_TO_SCRAPE

  if (!urls.length) {
    console.log("  scrape-structured: no URLs configured — skipping")
    return stats
  }

  const [allCities, allCategories] = await Promise.all([
    prisma.city.findMany({ select: { id: true, slug: true } }),
    prisma.category.findMany({ select: { id: true, slug: true } }),
  ])
  const cityIndex = Object.fromEntries(allCities.map((c) => [c.slug, c.id]))
  const catIndex = Object.fromEntries(allCategories.map((c) => [c.slug, c.id]))

  for (const url of urls) {
    try {
      // Dedup by sourceUrl
      const existing = await prisma.jobListing.findFirst({ where: { sourceUrl: url }, select: { id: true } })
      if (existing) {
        console.log(`  skip (exists): ${url}`)
        stats.skipped++
        continue
      }

      console.log(`  Fetching: ${url}`)
      const posting = await fetchJsonLd(url)
      if (!posting) {
        console.warn(`  No JSON-LD JobPosting found at ${url}`)
        stats.errors++
        continue
      }

      const title = posting.title ?? "General Worker"
      const cityName = extractCity(posting)
      const citySlug = resolveCitySlug(cityName) ?? "delhi"
      const cityId = cityIndex[citySlug] ?? cityIndex["delhi"]
      if (!cityId) {
        console.warn(`  No DB city for slug "${citySlug}" — skipping`)
        stats.errors++
        continue
      }

      const catSlug = guessCategorySlug(title, posting.description ?? "")
      const categoryId = catIndex[catSlug] ?? catIndex["fieldWork"]
      if (!categoryId) {
        console.warn(`  No DB category for slug "${catSlug}" — skipping`)
        stats.errors++
        continue
      }

      const { min: salaryMin, max: salaryMax, unit: salaryUnit } = parseSalary(posting)
      const experienceMin = parseExperience(posting)
      const jobType = parseJobType(posting)
      const qualificationRequired = parseQualification(posting)
      const vacancies = posting.totalJobOpenings ?? 1

      // Generate a fresh description — never use verbatim source content
      const description = generateJobDescription({
        title,
        city: cityName || "Delhi",
        salaryMin,
        salaryMax,
        salaryUnit,
        category: catSlug,
        jobType,
        experienceMin,
        qualificationRequired,
      })

      const expiresAt = posting.validThrough ? new Date(posting.validThrough) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

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
          jobType,
          experienceMin,
          qualificationRequired,
          status: "PENDING_REVIEW",
          source: "SCRAPED",
          sourceUrl: url,
          lastScrapedAt: new Date(),
          expiresAt,
        },
      })

      stats.inserted++
      console.log(`  ✓ Inserted: ${title} (${cityName})`)
    } catch (err) {
      console.error(`  ✗ Error processing ${url}:`, err)
      stats.errors++
    }
  }

  return stats
}
