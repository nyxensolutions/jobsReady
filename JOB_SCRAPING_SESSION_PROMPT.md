# Job Scraping Session — Starter Prompt

Copy and paste this as the first message in a new Claude Code session inside D:\Nyxen\jobsReady:

---

I need to build a job scraping system for the Job Ready platform (Next.js 15, Prisma 7, Supabase/PostgreSQL).

**Goal:** Collect blue-collar job listings from public, scraping-permitted sources and insert them directly into our Supabase DB via Prisma. First target: Delhi NCR (Delhi, Noida, Gurgaon, Faridabad, Ghaziabad, Meerut, Hapur, Greater Noida).

**Schema context (already in DB):**
```
model JobListing {
  id                    String   @id @default(uuid())
  employerId            String   // use a "scraper" employer account's ID
  categoryId            String
  cityId                String
  title                 String
  description           String
  salaryMin             Int?
  salaryMax             Int?
  salaryUnit            String   @default("monthly")
  vacancies             Int      @default(1)
  jobType               JobType  @default(FULL_TIME)
  experienceMin         Int      @default(0)
  requirements          String[]
  perks                 String[]
  qualificationRequired String?
  status                JobStatus @default("PENDING_REVIEW")  // admin approves before going live
  source                String   @default("EMPLOYER")         // set to "SCRAPED"
  sourceUrl             String?  // canonical URL of the original listing
  lastScrapedAt         DateTime?
}
```

**Key IDs needed before running (read from DB):**
1. A `EmployerProfile.id` for a "scraper bot" employer (create one if not exists with companyName "Job Ready Scraped Jobs")
2. `Category` IDs by slug (delivery, driver, sales, security, housekeeping, cook, etc.)
3. `City` IDs by name for Delhi NCR cities

**Legal & copyright approach:**
- Only scrape sites that allow it in robots.txt or have a partnership/API
- Rewrite/summarize descriptions — never copy verbatim. Generate a fresh job description from structured data (title, salary, location, requirements)
- Store `sourceUrl` for attribution and deduplication
- Skip if `sourceUrl` already exists in DB (upsert by sourceUrl)
- Set `status = "PENDING_REVIEW"` so admin reviews before going live

**Approved sources to start with:**
1. **Indian government NCS (National Career Service)** — ncs.gov.in has an open data API for job listings. Endpoint: https://www.ncs.gov.in/api/... (explore docs). Completely copyright-free as government data.
2. **Indeed India (structured data)** — indeed.co.in job pages expose JSON-LD structured data in `<script type="application/ld+json">`. Fetching individual pages and extracting JSON-LD is a well-established pattern. Do NOT scrape bulk listing pages. Only follow links if we have them. Check robots.txt first.
3. **Rozgar Mela / government job fairs** — press.gov.in and state employment exchange sites regularly post structured PDFs and tables of job melas (fairs) with employer + vacancy info.

**What to build:**
1. `scripts/scrape-ncs.ts` — fetches NCS API for Delhi NCR blue-collar jobs, maps to our schema, upserts into DB
2. `scripts/scrape-structured.ts` — given a list of Indeed/Naukri URLs (provided manually), fetches JSON-LD from each page, extracts title/salary/location/requirements, generates fresh description via Claude API, upserts into DB
3. `scripts/generate-description.ts` — helper that calls Claude claude-haiku-4-5 to generate a 100-word original job description from structured fields (title, salary, city, requirements, company type)
4. A cron-ready wrapper: `scripts/run-scraper.ts` that calls all scrapers and logs summary

**Run with:** `npx tsx scripts/run-scraper.ts`

**DB connection:** Uses existing `prisma.config.ts` + `.env.local` (DIRECT_URL = Session Pooler, port 5432).

**Please start by:**
1. Reading `prisma/schema.prisma` to understand the full model
2. Reading `prisma.config.ts` to understand DB config
3. Checking the NCS API (search web for "ncs.gov.in job listing API" or "https://www.ncs.gov.in/pages/en/developer-api.aspx")
4. Building `scripts/scrape-ncs.ts` first as it's the cleanest legal source
5. Then build the structured-data extractor for URLs I'll provide

Categories to target first: delivery, driver, security, housekeeping, cook, factory, construction, retail.
