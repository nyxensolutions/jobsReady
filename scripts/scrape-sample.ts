/**
 * Sample job pool for Delhi NCR blue-collar listings.
 * Used when external APIs are unavailable.
 * Each job has a stable sourceUrl — already-inserted ones are skipped automatically.
 */
import { config } from "dotenv"
config({ path: ".env.local" })

import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { generateJobDescription } from "./generate-description"

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

interface SampleJob {
  id: string
  title: string
  city: string
  category: string
  salaryMin: number
  salaryMax: number
  salaryUnit: string
  jobType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "GIG"
  experienceMin: number
  vacancies: number
  requirements: string[]
  qualificationRequired?: string
  perks: string[]
}

const JOB_POOL: SampleJob[] = [
  // ── Delivery ──────────────────────────────────────────────────────────────
  { id: "del-001", title: "Delivery Boy", city: "Delhi", category: "delivery", salaryMin: 12000, salaryMax: 18000, salaryUnit: "monthly", jobType: "FULL_TIME", experienceMin: 0, vacancies: 5, requirements: ["Two-wheeler license", "Smartphone", "Knowledge of Delhi routes"], qualificationRequired: "10th Pass", perks: ["Petrol allowance", "Mobile recharge"] },
  { id: "del-002", title: "Delivery Executive", city: "Noida", category: "delivery", salaryMin: 14000, salaryMax: 20000, salaryUnit: "monthly", jobType: "FULL_TIME", experienceMin: 1, vacancies: 8, requirements: ["Valid driving license", "Own two-wheeler preferred", "Good communication"], qualificationRequired: "10th Pass", perks: ["Incentives on deliveries", "PF & ESI"] },
  { id: "del-003", title: "Last Mile Delivery Agent", city: "Gurgaon", category: "delivery", salaryMin: 15000, salaryMax: 22000, salaryUnit: "monthly", jobType: "FULL_TIME", experienceMin: 0, vacancies: 10, requirements: ["Two-wheeler", "Android phone", "Punctuality"], qualificationRequired: "10th Pass", perks: ["Weekly payout option", "Fuel reimbursement"] },
  { id: "del-004", title: "Courier Delivery Staff", city: "Faridabad", category: "delivery", salaryMin: 11000, salaryMax: 16000, salaryUnit: "monthly", jobType: "FULL_TIME", experienceMin: 0, vacancies: 4, requirements: ["Bike license", "Area knowledge"], qualificationRequired: "8th Pass", perks: ["Daily allowance", "Sunday off"] },
  { id: "del-005", title: "E-Commerce Delivery Partner", city: "Ghaziabad", category: "delivery", salaryMin: 13000, salaryMax: 19000, salaryUnit: "monthly", jobType: "GIG", experienceMin: 0, vacancies: 15, requirements: ["Smartphone with internet", "Two-wheeler"], qualificationRequired: "10th Pass", perks: ["Flexible hours", "Performance bonus"] },

  // ── Driver ────────────────────────────────────────────────────────────────
  { id: "drv-001", title: "Car Driver", city: "Delhi", category: "driver", salaryMin: 16000, salaryMax: 24000, salaryUnit: "monthly", jobType: "FULL_TIME", experienceMin: 2, vacancies: 3, requirements: ["Valid LMV license", "Clean driving record", "Hindi & basic English"], qualificationRequired: "10th Pass", perks: ["Uniform provided", "Overtime pay"] },
  { id: "drv-002", title: "Cab Driver", city: "Gurgaon", category: "driver", salaryMin: 18000, salaryMax: 28000, salaryUnit: "monthly", jobType: "FULL_TIME", experienceMin: 3, vacancies: 5, requirements: ["Commercial vehicle license", "5+ years experience", "Knowledge of NCR routes"], qualificationRequired: "10th Pass", perks: ["Night shift allowance", "PF & ESI"] },
  { id: "drv-003", title: "Heavy Vehicle Driver", city: "Noida", category: "driver", salaryMin: 20000, salaryMax: 30000, salaryUnit: "monthly", jobType: "FULL_TIME", experienceMin: 3, vacancies: 2, requirements: ["HMV license mandatory", "Interstate experience"], qualificationRequired: "8th Pass", perks: ["Daily allowance", "Accommodation for long trips"] },
  { id: "drv-004", title: "School Bus Driver", city: "Faridabad", category: "driver", salaryMin: 15000, salaryMax: 20000, salaryUnit: "monthly", jobType: "FULL_TIME", experienceMin: 2, vacancies: 2, requirements: ["LMV license", "No criminal record", "Patient attitude"], qualificationRequired: "10th Pass", perks: ["Fixed timings 6am-2pm", "Holidays on school vacations"] },
  { id: "drv-005", title: "Tempo Driver", city: "Greater Noida", category: "driver", salaryMin: 14000, salaryMax: 20000, salaryUnit: "monthly", jobType: "FULL_TIME", experienceMin: 1, vacancies: 3, requirements: ["LMV/transport license", "Local area knowledge"], qualificationRequired: "8th Pass", perks: ["Petrol provided", "Overtime pay"] },

  // ── Security ──────────────────────────────────────────────────────────────
  { id: "sec-001", title: "Security Guard", city: "Delhi", category: "security", salaryMin: 12000, salaryMax: 17000, salaryUnit: "monthly", jobType: "FULL_TIME", experienceMin: 0, vacancies: 20, requirements: ["Ex-serviceman preferred", "Physically fit", "Age 21-45"], qualificationRequired: "10th Pass", perks: ["Uniform & boots provided", "PF & ESI", "Weekly off"] },
  { id: "sec-002", title: "Security Supervisor", city: "Gurgaon", category: "security", salaryMin: 18000, salaryMax: 25000, salaryUnit: "monthly", jobType: "FULL_TIME", experienceMin: 3, vacancies: 4, requirements: ["Prior security supervisory experience", "Team handling skills", "Security agency experience"], qualificationRequired: "12th Pass", perks: ["Night shift allowance", "PF & ESI"] },
  { id: "sec-003", title: "Mall Security Guard", city: "Noida", category: "security", salaryMin: 13000, salaryMax: 18000, salaryUnit: "monthly", jobType: "FULL_TIME", experienceMin: 1, vacancies: 10, requirements: ["CCTV monitoring experience", "Customer interaction skills", "Physical fitness"], qualificationRequired: "10th Pass", perks: ["AC workplace", "Uniform provided"] },
  { id: "sec-004", title: "Night Security Guard", city: "Meerut", category: "security", salaryMin: 11000, salaryMax: 15000, salaryUnit: "monthly", jobType: "FULL_TIME", experienceMin: 0, vacancies: 6, requirements: ["Must be comfortable with night shifts", "Physically fit"], qualificationRequired: "8th Pass", perks: ["Night allowance", "Meals provided"] },

  // ── Housekeeping ──────────────────────────────────────────────────────────
  { id: "hk-001", title: "Housekeeping Staff", city: "Delhi", category: "housekeeping", salaryMin: 10000, salaryMax: 15000, salaryUnit: "monthly", jobType: "FULL_TIME", experienceMin: 0, vacancies: 10, requirements: ["Knowledge of cleaning chemicals", "Punctuality", "Physical fitness"], qualificationRequired: "8th Pass", perks: ["Uniform provided", "Weekly off", "ESI"] },
  { id: "hk-002", title: "Hospital Housekeeping", city: "Gurgaon", category: "housekeeping", salaryMin: 12000, salaryMax: 16000, salaryUnit: "monthly", jobType: "FULL_TIME", experienceMin: 1, vacancies: 15, requirements: ["Infection control awareness", "Biohazard handling knowledge", "Health certificate"], qualificationRequired: "8th Pass", perks: ["PF & ESI", "Canteen facility"] },
  { id: "hk-003", title: "Office Housekeeping Boy", city: "Noida", category: "housekeeping", salaryMin: 10000, salaryMax: 14000, salaryUnit: "monthly", jobType: "FULL_TIME", experienceMin: 0, vacancies: 8, requirements: ["Maintain cleanliness", "Serve tea/coffee"], qualificationRequired: "8th Pass", perks: ["Meals provided", "Sunday off"] },
  { id: "hk-004", title: "Hotel Room Attendant", city: "Delhi", category: "housekeeping", salaryMin: 13000, salaryMax: 18000, salaryUnit: "monthly", jobType: "FULL_TIME", experienceMin: 1, vacancies: 5, requirements: ["Hotel housekeeping experience", "Linen & laundry handling"], qualificationRequired: "10th Pass", perks: ["Uniform & meals provided", "Hotel accommodation option"] },

  // ── Cook ──────────────────────────────────────────────────────────────────
  { id: "ck-001", title: "Cook", city: "Delhi", category: "cook", salaryMin: 12000, salaryMax: 20000, salaryUnit: "monthly", jobType: "FULL_TIME", experienceMin: 2, vacancies: 3, requirements: ["North Indian cooking expertise", "Bulk cooking experience", "Kitchen hygiene knowledge"], qualificationRequired: "8th Pass", perks: ["Meals included", "Weekly off"] },
  { id: "ck-002", title: "Tiffin Service Cook", city: "Noida", category: "cook", salaryMin: 10000, salaryMax: 15000, salaryUnit: "monthly", jobType: "FULL_TIME", experienceMin: 1, vacancies: 2, requirements: ["Early morning availability", "Variety cooking", "Time management"], qualificationRequired: "8th Pass", perks: ["Flexible hours", "Tips from customers"] },
  { id: "ck-003", title: "Factory Canteen Cook", city: "Faridabad", category: "cook", salaryMin: 14000, salaryMax: 18000, salaryUnit: "monthly", jobType: "FULL_TIME", experienceMin: 2, vacancies: 2, requirements: ["Bulk cooking (300+ meals)", "FSSAI food safety knowledge"], qualificationRequired: "8th Pass", perks: ["Meals & accommodation provided", "PF & ESI"] },
  { id: "ck-004", title: "Restaurant Cook", city: "Gurgaon", category: "cook", salaryMin: 15000, salaryMax: 25000, salaryUnit: "monthly", jobType: "FULL_TIME", experienceMin: 3, vacancies: 2, requirements: ["Multi-cuisine cooking", "Fast-paced kitchen experience"], qualificationRequired: "10th Pass", perks: ["Meals provided", "Performance bonus"] },

  // ── Factory ───────────────────────────────────────────────────────────────
  { id: "fac-001", title: "Factory Worker", city: "Faridabad", category: "factory", salaryMin: 11000, salaryMax: 16000, salaryUnit: "monthly", jobType: "FULL_TIME", experienceMin: 0, vacancies: 25, requirements: ["Physical fitness", "Willingness to do shift work", "Basic hand tool knowledge"], qualificationRequired: "8th Pass", perks: ["PF & ESI", "Overtime pay", "Canteen facility"] },
  { id: "fac-002", title: "Machine Operator", city: "Ghaziabad", category: "factory", salaryMin: 14000, salaryMax: 20000, salaryUnit: "monthly", jobType: "FULL_TIME", experienceMin: 2, vacancies: 8, requirements: ["CNC/lathe machine operation", "Quality checking", "Safety compliance"], qualificationRequired: "ITI Certificate", perks: ["Skill-based increment", "PF & ESI"] },
  { id: "fac-003", title: "Packing Helper", city: "Noida", category: "factory", salaryMin: 10000, salaryMax: 14000, salaryUnit: "monthly", jobType: "FULL_TIME", experienceMin: 0, vacancies: 20, requirements: ["Speed & accuracy", "Shift flexibility"], qualificationRequired: "8th Pass", perks: ["Daily attendance bonus", "ESI"] },
  { id: "fac-004", title: "Quality Control Inspector", city: "Greater Noida", category: "factory", salaryMin: 16000, salaryMax: 24000, salaryUnit: "monthly", jobType: "FULL_TIME", experienceMin: 2, vacancies: 4, requirements: ["QC inspection experience", "Measuring instrument knowledge", "Defect identification"], qualificationRequired: "ITI/Diploma", perks: ["PF & ESI", "Skill allowance"] },

  // ── Construction ──────────────────────────────────────────────────────────
  { id: "con-001", title: "Mason", city: "Delhi", category: "construction", salaryMin: 600, salaryMax: 900, salaryUnit: "daily", jobType: "CONTRACT", experienceMin: 3, vacancies: 10, requirements: ["Brickwork", "Plastering", "RCC work experience"], qualificationRequired: "No formal education required", perks: ["Tools provided", "Site accommodation available"] },
  { id: "con-002", title: "Electrician", city: "Noida", category: "construction", salaryMin: 18000, salaryMax: 28000, salaryUnit: "monthly", jobType: "FULL_TIME", experienceMin: 2, vacancies: 5, requirements: ["Wiring & panel work", "ITI electrician certificate preferred"], qualificationRequired: "ITI Certificate", perks: ["PF & ESI", "Safety equipment provided"] },
  { id: "con-003", title: "Plumber", city: "Gurgaon", category: "construction", salaryMin: 17000, salaryMax: 25000, salaryUnit: "monthly", jobType: "FULL_TIME", experienceMin: 2, vacancies: 4, requirements: ["Pipe fitting", "Sanitation work", "Basic plumbing tools"], qualificationRequired: "ITI preferred", perks: ["Vehicle provided for site visits", "Overtime pay"] },
  { id: "con-004", title: "Construction Helper", city: "Hapur", category: "construction", salaryMin: 400, salaryMax: 600, salaryUnit: "daily", jobType: "CONTRACT", experienceMin: 0, vacancies: 20, requirements: ["Physical fitness", "Carrying materials", "Basic site work"], qualificationRequired: "No formal education required", perks: ["Daily wages", "Meals on site"] },

  // ── Sales ─────────────────────────────────────────────────────────────────
  { id: "sal-001", title: "Field Sales Executive", city: "Delhi", category: "sales", salaryMin: 15000, salaryMax: 25000, salaryUnit: "monthly", jobType: "FULL_TIME", experienceMin: 1, vacancies: 10, requirements: ["B2C sales experience", "Own two-wheeler preferred", "Local area knowledge"], qualificationRequired: "12th Pass", perks: ["Fuel allowance", "Monthly incentives up to ₹10,000"] },
  { id: "sal-002", title: "Telecaller", city: "Noida", category: "sales", salaryMin: 12000, salaryMax: 18000, salaryUnit: "monthly", jobType: "FULL_TIME", experienceMin: 0, vacancies: 15, requirements: ["Good Hindi communication", "Convincing skills", "Basic computer knowledge"], qualificationRequired: "12th Pass", perks: ["AC office", "Incentives on target achievement"] },
  { id: "sal-003", title: "Medical Sales Representative", city: "Gurgaon", category: "sales", salaryMin: 20000, salaryMax: 35000, salaryUnit: "monthly", jobType: "FULL_TIME", experienceMin: 2, vacancies: 5, requirements: ["Pharma product knowledge", "Doctor & chemist visits", "Sales target handling"], qualificationRequired: "Graduate", perks: ["Mobile + travel allowance", "Quarterly bonus"] },

  // ── Retail ────────────────────────────────────────────────────────────────
  { id: "ret-001", title: "Retail Store Associate", city: "Delhi", category: "retail", salaryMin: 12000, salaryMax: 16000, salaryUnit: "monthly", jobType: "FULL_TIME", experienceMin: 0, vacancies: 12, requirements: ["Customer service skills", "Cash handling", "Hindi & basic English"], qualificationRequired: "12th Pass", perks: ["Staff discount", "ESI & PF"] },
  { id: "ret-002", title: "Cashier", city: "Noida", category: "retail", salaryMin: 11000, salaryMax: 15000, salaryUnit: "monthly", jobType: "FULL_TIME", experienceMin: 0, vacancies: 6, requirements: ["Cash handling", "Basic billing software", "Honest & reliable"], qualificationRequired: "12th Pass", perks: ["Shift timing flexibility", "Weekly off"] },
  { id: "ret-003", title: "Supermarket Staff", city: "Gurgaon", category: "retail", salaryMin: 12000, salaryMax: 17000, salaryUnit: "monthly", jobType: "FULL_TIME", experienceMin: 0, vacancies: 20, requirements: ["Stock management", "Customer assistance", "Physical stamina"], qualificationRequired: "10th Pass", perks: ["PF & ESI", "Staff meals"] },
]

export async function sampleJobsScraper(
  employerId: string,
): Promise<{ inserted: number; skipped: number; errors: number }> {
  const stats = { inserted: 0, skipped: 0, errors: 0 }

  const [allCities, allCategories] = await Promise.all([
    prisma.city.findMany({ select: { id: true, slug: true } }),
    prisma.category.findMany({ select: { id: true, slug: true } }),
  ])
  const cityIndex = Object.fromEntries(allCities.map((c) => [c.slug, c.id]))
  const catIndex = Object.fromEntries(allCategories.map((c) => [c.slug, c.id]))

  const CITY_SLUG: Record<string, string> = {
    Delhi: "delhi", Noida: "noida", Gurgaon: "gurgaon", Faridabad: "faridabad",
    Ghaziabad: "ghaziabad", Meerut: "meerut", Hapur: "hapur", "Greater Noida": "greater-noida",
  }

  for (const job of JOB_POOL) {
    try {
      const sourceUrl = `internal://sample/${job.id}`

      const existing = await prisma.jobListing.findFirst({ where: { sourceUrl }, select: { id: true } })
      if (existing) { stats.skipped++; continue }

      const citySlug = CITY_SLUG[job.city] ?? "delhi"
      const cityId = cityIndex[citySlug]
      const categoryId = catIndex[job.category] ?? catIndex["fieldWork"]

      if (!cityId || !categoryId) {
        console.warn(`  Skipping ${job.id}: missing city/category in DB`)
        stats.errors++
        continue
      }

      const description = generateJobDescription({
        title: job.title,
        city: job.city,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        salaryUnit: job.salaryUnit,
        category: job.category,
        jobType: job.jobType,
        experienceMin: job.experienceMin,
        requirements: job.requirements,
        qualificationRequired: job.qualificationRequired,
      })

      await prisma.jobListing.create({
        data: {
          employerId,
          categoryId,
          cityId,
          title: job.title,
          description,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          salaryUnit: job.salaryUnit,
          vacancies: job.vacancies,
          jobType: job.jobType,
          experienceMin: job.experienceMin,
          requirements: job.requirements,
          perks: job.perks,
          qualificationRequired: job.qualificationRequired,
          status: "PENDING_REVIEW",
          source: "SCRAPED",
          sourceUrl,
          lastScrapedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      })

      stats.inserted++
      console.log(`  ✓ ${job.title} — ${job.city}`)
    } catch (err) {
      console.error(`  ✗ Error on ${job.id}:`, err)
      stats.errors++
    }
  }

  return stats
}
