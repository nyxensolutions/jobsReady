// Blog taxonomy.
//
// `jobCategorySlug` maps a blog silo onto a real `categories.slug` row in the DB
// (see prisma/seed.ts). Where it is set, category pages and live-job widgets can
// link straight into /jobs?category=… — which is the whole point of the silo.
// Editorial-only silos (interviews, resumes, safety) leave it undefined.

export type BlogCategory = {
  slug: string
  label: string
  /** Short line under the category heading; also the meta description. */
  description: string
  jobCategorySlug?: string
}

export const BLOG_CATEGORIES: BlogCategory[] = [
  {
    slug: "delivery",
    label: "Delivery Jobs",
    description:
      "Salary, joining requirements and earnings breakdowns for delivery boy, courier and last-mile jobs across India.",
    jobCategorySlug: "delivery",
  },
  {
    slug: "driver",
    label: "Driver Jobs",
    description:
      "Cab, truck, company and commercial driver jobs — licence requirements, pay scales and how to get hired.",
    jobCategorySlug: "driver",
  },
  {
    slug: "security",
    label: "Security Guard Jobs",
    description:
      "Security guard salaries, shift patterns, PSARA rules and career growth in the private security industry.",
    jobCategorySlug: "security",
  },
  {
    slug: "warehouse",
    label: "Warehouse & Logistics",
    description:
      "Picker, packer, loader and inventory roles in India's fast-growing warehousing and logistics sector.",
    jobCategorySlug: "warehouse",
  },
  {
    slug: "telecaller",
    label: "Telecaller & BPO",
    description:
      "Telecalling, customer support and BPO careers — job descriptions, salary bands, skills and growth paths.",
    jobCategorySlug: "telecaller",
  },
  {
    slug: "sales",
    label: "Sales & Field Work",
    description:
      "Field sales and business development roles where incentives often matter more than the fixed salary.",
    jobCategorySlug: "sales",
  },
  {
    slug: "housekeeping",
    label: "Housekeeping",
    description:
      "Housekeeping, cleaning and facility staff roles in hotels, hospitals, malls and corporate offices.",
    jobCategorySlug: "housekeeping",
  },
  {
    slug: "factory",
    label: "Factory & Production",
    description:
      "Factory worker, machine operator and production line jobs — shifts, ESI/PF benefits and pay.",
    jobCategorySlug: "factory",
  },
  {
    slug: "data-entry",
    label: "Data Entry & Back Office",
    description:
      "Data entry, back office and computer operator roles, including genuine work-from-home options.",
    jobCategorySlug: "data-entry",
  },
  {
    slug: "salary-guides",
    label: "Salary Guides",
    description:
      "What jobs actually pay in India — role-wise and city-wise salary breakdowns based on real listings.",
  },
  {
    slug: "interview-tips",
    label: "Interview Tips",
    description:
      "How to prepare for and clear interviews for frontline and blue-collar jobs, with sample answers.",
  },
  {
    slug: "resume",
    label: "Resume & Profile",
    description:
      "Build a resume and a job profile that gets shortlisted — even if you have no formal work experience.",
  },
  {
    slug: "job-safety",
    label: "Job Safety & Scams",
    description:
      "Spot fake job offers, avoid registration-fee frauds and stay safe while searching for work online.",
  },
  {
    slug: "career-guide",
    label: "Career Guide",
    description:
      "Choosing a career path, switching roles and growing from an entry-level job into a supervisory one.",
  },
]

export function getBlogCategory(slug: string): BlogCategory | undefined {
  return BLOG_CATEGORIES.find((c) => c.slug === slug)
}
