import type { Metadata } from "next"
import { Link } from "@/i18n/navigation"
import { ArrowRight } from "lucide-react"
import { getAllPosts, getPopulatedCategories, countByCategory, postUrl, formatPostDate, readingMinutes } from "@/lib/blog"
import { alternatesFor, absoluteUrl, SITE_NAME } from "@/lib/seo"
import PostCard from "@/components/blog/PostCard"

type Props = { params: Promise<{ locale: string }> }

const TITLE = "Career Guide & Job Advice"
const DESCRIPTION =
  "Salary guides, job descriptions, interview tips and job-safety advice for delivery, driver, security, warehouse, telecalling and other frontline jobs across India."

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: alternatesFor(locale, "/blog"),
    openGraph: {
      title: `${TITLE} | ${SITE_NAME}`,
      description: DESCRIPTION,
      url: absoluteUrl("/blog"),
      type: "website",
    },
  }
}

export default async function BlogIndexPage({ params }: Props) {
  const { locale } = await params
  const posts = getAllPosts()
  const categories = getPopulatedCategories()
  const [featured, ...rest] = posts

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-[#1a3461] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-2xl sm:text-4xl font-black mb-3">Jobs24India Blog</h1>
          <p className="text-blue-100 max-w-2xl leading-relaxed">
            Honest salary breakdowns, job descriptions and hiring advice for frontline and blue-collar work in
            India — written for people looking for a job today, not for a career ten years away.
          </p>
        </div>
      </div>

      {/* Hindi language notice */}
      {locale === "hi" && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm text-amber-800">
              📖 ये लेख अंग्रेज़ी में हैं। हिंदी में पढ़ने के लिए Google Translate का उपयोग करें।
            </p>
            <a
              href={`https://translate.google.com/translate?sl=en&tl=hi&u=${encodeURIComponent("https://jobs24india.com/hi/blog")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-amber-800 border border-amber-400 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors shrink-0"
            >
              हिंदी में अनुवाद करें →
            </a>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Category strip */}
        <nav aria-label="Blog categories" className="flex flex-wrap gap-2 mb-10">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/blog/${category.slug}`}
              className="bg-white border border-gray-200 text-sm font-semibold text-[#1a3461] px-4 py-2 rounded-xl hover:border-[#1a3461]/30 hover:shadow-sm transition-all"
            >
              {category.label}
              <span className="text-gray-400 font-normal ml-1.5">{countByCategory(category.slug)}</span>
            </Link>
          ))}
        </nav>

        {/* Featured */}
        {featured && (
          <Link
            href={postUrl(featured)}
            className="group block bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 mb-8 hover:shadow-md hover:border-[#1a3461]/20 transition-all"
          >
            <span className="text-[11px] font-bold uppercase tracking-wide text-blue-600">Latest</span>
            <h2 className="text-xl sm:text-2xl font-black text-[#1a3461] mt-2 mb-3 group-hover:text-blue-700 transition-colors">
              {featured.title}
            </h2>
            <p className="text-gray-500 leading-relaxed max-w-3xl">{featured.excerpt}</p>
            <div className="flex items-center gap-3 mt-4 text-xs text-gray-400">
              <time dateTime={featured.publishedAt}>{formatPostDate(featured.publishedAt)}</time>
              <span>{readingMinutes(featured)} min read</span>
              <span className="inline-flex items-center gap-1 text-blue-600 font-bold">
                Read guide <ArrowRight size={13} />
              </span>
            </div>
          </Link>
        )}

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rest.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </div>
  )
}
