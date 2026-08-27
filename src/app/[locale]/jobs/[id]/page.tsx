import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import Link from "next/link"
import { MapPin, Clock, Users, ArrowLeft, CheckCircle, IndianRupee, Briefcase, Calendar, GraduationCap, ChevronRight, Share2, Phone } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"
import { prisma } from "@/lib/db"
import { getServerSession } from "@/lib/firebase/session"
import ApplyButton from "@/components/jobs/ApplyButton"
import SaveJobButton from "@/components/jobs/SaveJobButton"

type Props = {
  params: Promise<{ id: string; locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const job = await prisma.jobListing.findUnique({
    where: { id },
    select: {
      title: true,
      description: true,
      salaryMin: true,
      salaryMax: true,
      salaryUnit: true,
      source: true,
      employer: { select: { companyName: true } },
      city: { select: { name: true } },
      category: { select: { nameEn: true } },
    },
  })

  if (!job) return {}

  const scraped = job.source === "SCRAPED"
  const metaCompany = scraped ? job.city.name : job.employer.companyName
  const salary = job.salaryMin
    ? `₹${(job.salaryMin / 1000).toFixed(0)}K–${job.salaryMax ? `₹${(job.salaryMax / 1000).toFixed(0)}K` : ""}/${job.salaryUnit === "daily" ? "day" : "month"}`
    : ""
  const description = `${job.title} in ${metaCompany}. ${salary ? salary + ". " : ""}${job.description.slice(0, 140)}`

  return {
    title: `${job.title} in ${metaCompany} — Jobs24India`,
    description,
    openGraph: {
      title: `${job.title} — ${metaCompany}`,
      description,
      type: "article",
    },
  }
}

function formatSalary(
  min?: number | null,
  max?: number | null,
  unit = "monthly",
  asPerInterview = "As per interview"
) {
  const suffix = unit === "daily" ? "/day" : "/month"
  const fmt = (n: number) =>
    n >= 1000 ? `₹${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K` : `₹${n}`
  if (min && max) return `${fmt(min)} – ${fmt(max)}${suffix}`
  if (min) return `From ${fmt(min)}${suffix}`
  if (max) return `Up to ${fmt(max)}${suffix}`
  return asPerInterview
}

export default async function JobDetailPage({ params }: Props) {
  const { id, locale } = await params
  const t = await getTranslations("jobs")
  const tt = await getTranslations("jobs.types")

  const job = await prisma.jobListing.findUnique({
    where: { id },
    include: {
      employer: {
        select: { companyName: true, description: true, contactPhone: true, city: true },
      },
      category: { select: { slug: true, nameEn: true } },
      city: { select: { name: true } },
    },
  })

  // Call-to-HR: only surface if enabled AND phone is set
  const callToHrPhone = job?.callToHrEnabled && job?.callToHrPhone ? job.callToHrPhone : null

  const isScraped = job?.source === "SCRAPED"
  const displayCompany = isScraped ? null : job?.employer.companyName

  if (!job || job.status !== "ACTIVE") notFound()

  // fire-and-forget — don't block render
  prisma.jobListing.update({ where: { id }, data: { viewCount: { increment: 1 } } }).catch(() => {})

  // Similar jobs — same category, exclude current
  const similarJobs = await prisma.jobListing.findMany({
    where: { status: "ACTIVE", categoryId: job.categoryId, id: { not: id } },
    include: {
      employer: { select: { companyName: true } },
      city: { select: { name: true } },
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: 4,
  })

  // Check if logged-in seeker has saved this job
  let isSaved = false
  try {
    const session = await getServerSession()
    if (session) {
      const seeker = await prisma.seekerProfile.findFirst({ where: { userId: session.uid }, select: { id: true } })
      if (seeker) {
        const saved = await prisma.savedJob.findUnique({ where: { seekerId_jobId: { seekerId: seeker.id, jobId: id } } })
        isSaved = !!saved
      }
    }
  } catch {
    // non-fatal — default false
  }

  const asPerInterview = t("asPerInterview")
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryUnit, asPerInterview)
  const companyInitial = (displayCompany ?? job.category.nameEn)[0].toUpperCase()
  const fresherExp = t("freshersOk")

  const typeLabel = (() => { try { return tt(job.jobType as any) } catch { return job.jobType } })()

  const otherDetails = [
    { label: t("jobDetail.jobType"),    value: typeLabel },
    { label: t("jobDetail.experience"), value: job.experienceMin === 0 ? fresherExp : `${job.experienceMin}+ years` },
    { label: t("jobDetail.openings"),   value: `${job.vacancies}` },
    { label: t("jobDetail.salary"),     value: salary },
    { label: t("jobDetail.location"),   value: job.city.name },
    { label: t("jobDetail.posted"),     value: formatRelativeTime(job.createdAt) },
    ...(job.shiftType        ? [{ label: t("jobDetail.shift"),       value: `${job.shiftType} Shift` }] : []),
    ...(job.workingDaysPerWeek ? [{ label: t("jobDetail.workingDays"), value: `${job.workingDaysPerWeek} days/week` }] : []),
    ...(job.incentives       ? [{ label: t("jobDetail.incentives"),  value: job.incentives }] : []),
  ]

  const faqs = [
    {
      q: t("jobDetail.faqFreshers", { category: job.category.nameEn }),
      a: job.experienceMin === 0
        ? t("jobDetail.faqFreshersYes")
        : t("jobDetail.faqFreshersNo", { years: job.experienceMin }),
    },
    {
      q: t("jobDetail.faqSalaryQ", { title: job.title }),
      a: t("jobDetail.faqSalaryA", { salary }),
    },
    {
      q: t("jobDetail.faqOpeningsQ"),
      a: t("jobDetail.faqOpeningsA", { count: job.vacancies }),
    },
    {
      q: t("jobDetail.faqLocationQ"),
      a: t("jobDetail.faqLocationA", { city: job.city.name }),
    },
  ]

  const whatsappText = encodeURIComponent(`${job.title} in ${job.city.name} — ${salary} — Apply: https://jobs24india.com/jobs/${job.id}`)

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.createdAt.toISOString(),
    validThrough: job.expiresAt?.toISOString(),
    employmentType: job.jobType === "FULL_TIME" ? "FULL_TIME" : job.jobType === "PART_TIME" ? "PART_TIME" : "CONTRACTOR",
    hiringOrganization: { "@type": "Organization", name: displayCompany ?? "Company" },
    jobLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: job.city.name, addressCountry: "IN" },
    },
    baseSalary: job.salaryMin
      ? {
          "@type": "MonetaryAmount",
          currency: "INR",
          value: {
            "@type": "QuantitativeValue",
            minValue: job.salaryMin,
            maxValue: job.salaryMax ?? job.salaryMin,
            unitText: job.salaryUnit === "daily" ? "DAY" : "MONTH",
          },
        }
      : undefined,
    experienceRequirements: job.experienceMin === 0 ? "no requirements" : `${job.experienceMin} years`,
    totalJobOpenings: job.vacancies,
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
          <Link href="/jobs" className="hover:text-[#1a3461] flex items-center gap-1">
            <ArrowLeft size={13} /> {t("breadcrumb")}
          </Link>
          <ChevronRight size={12} />
          <Link href={`/jobs?category=${job.category.slug}`} className="hover:text-[#1a3461]">
            {job.category.nameEn}
          </Link>
          <ChevronRight size={12} />
          <span className="text-gray-600 truncate max-w-[200px]">{job.title}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">

          {/* ── Main content ── */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* Job header card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6">
              {job.isFeatured && (
                <span className="inline-flex items-center text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full mb-3">
                  ★ {t("featuredBadge")}
                </span>
              )}

              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#eef2ff] text-[#1a3461] flex items-center justify-center font-black text-xl shrink-0 border border-[#dde5ff]">
                  {companyInitial}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold text-[#1a3461] leading-tight">{job.title}</h1>
                  {displayCompany && <p className="text-gray-500 mt-1 text-sm">{displayCompany}</p>}

                  <p className="text-2xl font-black text-green-600 mt-2">{salary}</p>

                  <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><MapPin size={12} />{job.city.name}</span>
                    <span className="flex items-center gap-1">
                      <Users size={12} />{job.vacancies} {job.vacancies === 1 ? t("opening") : t("openings")}
                    </span>
                    <span className="flex items-center gap-1"><Clock size={12} />{formatRelativeTime(job.createdAt)}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-xs bg-gray-100 text-gray-700 font-semibold px-2.5 py-1 rounded-full">
                      {typeLabel}
                    </span>
                    {job.experienceMin === 0 && (
                      <span className="text-xs bg-green-50 text-green-700 font-semibold px-2.5 py-1 rounded-full border border-green-100">
                        {fresherExp}
                      </span>
                    )}
                    <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-full">
                      {job.category.nameEn}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mobile CTA */}
              <div className="lg:hidden mt-5 pt-4 border-t border-gray-100 flex flex-col gap-2">
                <ApplyButton jobId={job.id} locale={locale} />
                {callToHrPhone && (
                  <a
                    href={`tel:+91${callToHrPhone}`}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-orange-400 text-orange-600 font-bold text-sm hover:bg-orange-50 transition-colors"
                  >
                    <Phone size={15} /> Call HR: +91 {callToHrPhone}
                  </a>
                )}
                <SaveJobButton jobId={job.id} initialSaved={isSaved} locale={locale} />
                <a
                  href={`https://wa.me/?text=${whatsappText}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2 border border-green-500 text-green-700 rounded-xl text-sm font-bold hover:bg-green-50 transition-colors"
                >
                  <Share2 size={15} /> {t("jobDetail.shareWhatsapp")}
                </a>
              </div>
            </div>

            {/* Job Highlights */}
            <div className="bg-[#eef2ff] border border-[#dde5ff] rounded-2xl p-5">
              <h2 className="font-bold text-[#1a3461] mb-4 flex items-center gap-2">
                <Briefcase size={16} className="text-[#1a3461]" />
                {t("jobDetail.highlights")}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-white rounded-xl p-3 border border-[#dde5ff]">
                  <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><GraduationCap size={12} /> {t("jobDetail.education")}</p>
                  <p className="text-sm font-semibold text-[#1a3461]">{t("jobDetail.allLevels")}</p>
                </div>
                <div className="bg-white rounded-xl p-3 border border-[#dde5ff]">
                  <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><Users size={12} /> {t("jobDetail.openings")}</p>
                  <p className="text-sm font-semibold text-[#1a3461]">{job.vacancies}</p>
                </div>
                <div className="bg-white rounded-xl p-3 border border-[#dde5ff]">
                  <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><IndianRupee size={12} /> {t("jobDetail.salary")}</p>
                  <p className="text-sm font-semibold text-green-600">{salary}</p>
                </div>
                <div className="bg-white rounded-xl p-3 border border-[#dde5ff]">
                  <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><Calendar size={12} /> {t("jobDetail.experience")}</p>
                  <p className="text-sm font-semibold text-[#1a3461]">
                    {job.experienceMin === 0 ? fresherExp : t("jobDetail.fresherYrsExp", { years: job.experienceMin })}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-3 border border-[#dde5ff]">
                  <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><MapPin size={12} /> {t("jobDetail.location")}</p>
                  <p className="text-sm font-semibold text-[#1a3461]">{job.city.name}</p>
                </div>
                <div className="bg-white rounded-xl p-3 border border-[#dde5ff]">
                  <p className="text-xs text-gray-400 mb-1">{t("jobDetail.jobType")}</p>
                  <p className="text-sm font-semibold text-[#1a3461]">{typeLabel}</p>
                </div>
              </div>
            </div>

            {/* Perks */}
            {job.perks.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h2 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide text-gray-500">{t("jobDetail.benefits")}</h2>
                <div className="flex flex-wrap gap-2">
                  {job.perks.map((p, i) => (
                    <span key={i} className="text-xs bg-orange-50 text-orange-700 border border-orange-100 px-3 py-1.5 rounded-full font-medium">
                      ✓ {p}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="font-bold text-gray-900 mb-4">{t("jobDetail.about")}</h2>
              <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {job.description}
              </div>
            </div>

            {/* Requirements */}
            {job.requirements.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h2 className="font-bold text-gray-900 mb-4">{t("jobDetail.requirements")}</h2>
                <ul className="flex flex-col gap-2.5">
                  {job.requirements.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle size={15} className="text-green-500 shrink-0 mt-0.5" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Other Details */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="font-bold text-gray-900 mb-4">{t("jobDetail.otherDetails")}</h2>
              <div className="grid grid-cols-2 gap-3">
                {otherDetails.map(({ label, value }) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <span className="text-xs text-gray-400">{label}</span>
                    <span className="text-sm font-semibold text-gray-700">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* About company */}
            {!isScraped && job.employer.description && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h2 className="font-bold text-gray-900 mb-3">{t("jobDetail.aboutCompany")}</h2>
                <p className="text-sm text-gray-700 leading-relaxed">{job.employer.description}</p>
              </div>
            )}

            {/* FAQ */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h2 className="font-bold text-gray-900 mb-4">{t("jobDetail.faq")}</h2>
              <div className="flex flex-col divide-y divide-gray-100">
                {faqs.map(({ q, a }) => (
                  <div key={q} className="py-3">
                    <p className="text-sm font-semibold text-[#1a3461] mb-1">{q}</p>
                    <p className="text-sm text-gray-600">{a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Similar jobs */}
            {similarJobs.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900">{t("jobDetail.moreJobs", { category: job.category.nameEn })}</h2>
                  <Link href={`/jobs?category=${job.category.slug}`} className="text-xs text-[#1a3461] font-semibold hover:underline">
                    {t("jobDetail.seeAll" as any) ?? "See all →"}
                  </Link>
                </div>
                <div className="flex flex-col divide-y divide-gray-100">
                  {similarJobs.map((sj) => {
                    const sjSalary = formatSalary(sj.salaryMin, sj.salaryMax, sj.salaryUnit, asPerInterview)
                    const sjCompany = sj.source === "SCRAPED" ? sj.city.name : sj.employer.companyName
                    return (
                      <Link key={sj.id} href={`/jobs/${sj.id}`} className="py-3 flex items-start justify-between gap-3 hover:bg-gray-50 -mx-5 px-5 transition-colors">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#1a3461] truncate">{sj.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{sjCompany} · {sj.city.name}</p>
                        </div>
                        <p className="text-sm font-bold text-green-600 shrink-0">{sjSalary}</p>
                      </Link>
                    )
                  })}
                </div>
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                  <Link href={`/jobs?category=${job.category.slug}`} className="text-xs px-3 py-1.5 rounded-full bg-[#eef2ff] text-[#1a3461] font-medium hover:bg-[#dde5ff] transition-colors">
                    {job.category.nameEn} {t("breadcrumb")}
                  </Link>
                  <Link href={`/jobs?city=${job.city.name}`} className="text-xs px-3 py-1.5 rounded-full bg-[#eef2ff] text-[#1a3461] font-medium hover:bg-[#dde5ff] transition-colors">
                    {t("jobDetail.jobsInCity", { city: job.city.name })}
                  </Link>
                  {job.experienceMin === 0 && (
                    <Link href="/jobs?freshers=1" className="text-xs px-3 py-1.5 rounded-full bg-[#eef2ff] text-[#1a3461] font-medium hover:bg-[#dde5ff] transition-colors">
                      {t("jobDetail.fresherJobs")}
                    </Link>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* ── Sticky sidebar (desktop only) ── */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-5 sticky top-20">
              <div className="text-center mb-5 pb-4 border-b border-gray-100">
                <p className="text-xs text-gray-400 mb-1">
                  {job.salaryUnit === "daily" ? t("jobDetail.dailyWage") : t("jobDetail.monthlySalary")}
                </p>
                <p className="text-2xl font-black text-green-600">{salary}</p>
              </div>

              <ApplyButton
                jobId={job.id}
                contactPhone={job.employer.contactPhone}
                locale={locale}
              />
              {callToHrPhone && (
                <a
                  href={`tel:+91${callToHrPhone}`}
                  className="mt-2 flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-orange-400 text-orange-600 font-bold text-sm hover:bg-orange-50 transition-colors"
                >
                  <Phone size={15} /> Call HR: +91 {callToHrPhone}
                </a>
              )}
              <div className="mt-2">
                <SaveJobButton jobId={job.id} initialSaved={isSaved} locale={locale} />
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col gap-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-xs">{t("jobDetail.openings")}</span>
                  <span className="font-semibold text-gray-700 text-xs">{job.vacancies}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-xs">{t("jobDetail.experience")}</span>
                  <span className="font-semibold text-gray-700 text-xs">
                    {job.experienceMin === 0 ? fresherExp : t("jobDetail.fresherYrsExp", { years: job.experienceMin })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-xs">{t("jobDetail.jobType")}</span>
                  <span className="font-semibold text-gray-700 text-xs">{typeLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-xs">{t("jobDetail.location")}</span>
                  <span className="font-semibold text-gray-700 text-xs">{job.city.name}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
                <a
                  href={`https://wa.me/?text=${whatsappText}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2 border border-green-500 text-green-700 rounded-xl text-xs font-bold hover:bg-green-50 transition-colors"
                >
                  <Share2 size={14} /> {t("jobDetail.shareWhatsapp")}
                </a>
                <p className="text-xs text-gray-400 text-center">
                  {t("jobDetail.posted")} {formatRelativeTime(job.createdAt)}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
