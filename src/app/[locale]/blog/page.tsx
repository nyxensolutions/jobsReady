import type { Metadata } from "next"
import { Link } from "@/i18n/navigation"
import { ArrowRight } from "lucide-react"
import {
  getAllPosts,
  getPopulatedCategories,
  countByCategory,
  postUrl,
  formatPostDate,
  readingMinutes,
  localizeAll,
  localizeCategory,
  anyHindi,
} from "@/lib/blog"
import { contentAlternates, SITE_NAME } from "@/lib/seo"
import { blogUi } from "@/data/blog/ui"
import PostCard from "@/components/blog/PostCard"

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const lang = locale === "hi" ? "hi" : "en"
  const ui = blogUi(lang)
  const alternates = contentAlternates(locale, "/blog", anyHindi() ? ["hi"] : [])

  return {
    title: ui.indexTitle,
    description: ui.indexDescription,
    alternates,
    openGraph: {
      title: `${ui.indexTitle} | ${SITE_NAME}`,
      description: ui.indexDescription,
      url: alternates.canonical,
      type: "website",
      locale: lang === "hi" ? "hi_IN" : "en_IN",
    },
  }
}

export default async function BlogIndexPage({ params }: Props) {
  const { locale } = await params
  const pageLang = locale === "hi" ? "hi" : "en"
  const ui = blogUi(pageLang)

  const posts = localizeAll(getAllPosts(), locale)
  const categories = getPopulatedCategories().map((c) => localizeCategory(c, pageLang))
  const [featured, ...rest] = posts
  const hasUntranslated = pageLang === "hi" && posts.some((p) => p.lang === "en")

  return (
    <div lang={pageLang} className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-[#1a3461] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-2xl sm:text-4xl font-black mb-3">{ui.heroTitle}</h1>
          <p className="text-blue-100 max-w-2xl leading-relaxed">{ui.heroText}</p>
        </div>
      </div>

      {/* Some Hindi posts are still English-only — say so honestly instead of sending readers to a translator */}
      {hasUntranslated && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <p className="text-sm text-amber-800">{ui.untranslatedNote}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Category strip */}
        <nav aria-label={ui.categoriesAria} className="flex flex-wrap gap-2 mb-10">
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
            lang={featured.lang}
            className="group block bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 mb-8 hover:shadow-md hover:border-[#1a3461]/20 transition-all"
          >
            <span className="text-[11px] font-bold uppercase tracking-wide text-blue-600">
              {blogUi(featured.lang).latest}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#1a3461] mt-2 mb-3 group-hover:text-blue-700 transition-colors">
              {featured.title}
            </h2>
            <p className="text-gray-500 leading-relaxed max-w-3xl">{featured.excerpt}</p>
            <div className="flex items-center gap-3 mt-4 text-xs text-gray-400">
              <time dateTime={featured.publishedAt}>{formatPostDate(featured.publishedAt, featured.lang)}</time>
              <span>{blogUi(featured.lang).readTime(readingMinutes(featured))}</span>
              <span className="inline-flex items-center gap-1 text-blue-600 font-bold">
                {blogUi(featured.lang).readGuide} <ArrowRight size={13} />
              </span>
            </div>
          </Link>
        )}

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rest.map((post) => (
            <PostCard key={post.slug} post={post} pageLang={pageLang} />
          ))}
        </div>
      </div>
    </div>
  )
}
