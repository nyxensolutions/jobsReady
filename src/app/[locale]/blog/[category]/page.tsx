import type { Metadata } from "next"
import { Link } from "@/i18n/navigation"
import { notFound } from "next/navigation"
import { ChevronRight, ArrowRight } from "lucide-react"
import {
  BLOG_CATEGORIES,
  getBlogCategory,
  getPostsByCategory,
  localizeAll,
  localizeCategory,
  categoryHasHindi,
} from "@/lib/blog"
import { contentAlternates, SITE_NAME } from "@/lib/seo"
import { blogUi } from "@/data/blog/ui"
import PostCard from "@/components/blog/PostCard"

type Props = { params: Promise<{ locale: string; category: string }> }

export function generateStaticParams() {
  return BLOG_CATEGORIES.map((category) => ({ category: category.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category: slug } = await params
  const base = getBlogCategory(slug)
  if (!base) return {}

  const lang = locale === "hi" ? "hi" : "en"
  const category = localizeCategory(base, lang)
  const ui = blogUi(lang)
  // A Hindi category page is only worth indexing once it has a Hindi article in it.
  const alternates = contentAlternates(locale, `/blog/${slug}`, categoryHasHindi(slug) ? ["hi"] : [])

  const title = ui.categoryTitle(category.label)
  return {
    title,
    description: category.description,
    alternates,
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description: category.description,
      url: alternates.canonical,
      type: "website",
      locale: lang === "hi" ? "hi_IN" : "en_IN",
    },
  }
}

export default async function BlogCategoryPage({ params }: Props) {
  const { locale, category: slug } = await params
  const base = getBlogCategory(slug)
  if (!base) notFound()

  const pageLang = locale === "hi" ? "hi" : "en"
  const ui = blogUi(pageLang)
  const category = localizeCategory(base, pageLang)
  const posts = localizeAll(getPostsByCategory(slug), locale)
  const otherCategories = BLOG_CATEGORIES.filter((c) => c.slug !== slug).map((c) => localizeCategory(c, pageLang))

  return (
    <div lang={pageLang} className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
            <Link href="/" className="hover:text-[#1a3461]">{ui.home}</Link>
            <ChevronRight size={12} />
            <Link href="/blog" className="hover:text-[#1a3461]">{ui.careerGuide}</Link>
            <ChevronRight size={12} />
            <span className="text-gray-600 font-medium">{category.label}</span>
          </nav>

          <h1 className="text-2xl sm:text-3xl font-black text-[#1a3461] mb-2">{category.label}</h1>
          <p className="text-gray-500 max-w-2xl leading-relaxed">{category.description}</p>

          {category.jobCategorySlug && (
            <Link
              href={`/jobs?category=${category.jobCategorySlug}`}
              className="inline-flex items-center gap-1.5 mt-4 text-sm font-bold text-blue-600 hover:text-blue-700"
            >
              {ui.browseOpenings(category.label)}
              <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <p className="text-gray-500 mb-4">{ui.noArticles}</p>
            <Link href="/blog" className="text-sm font-bold text-blue-600 hover:text-blue-700">
              {ui.browseAll}
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} showCategory={false} pageLang={pageLang} />
            ))}
          </div>
        )}

        {/* Other silos — internal linking across the blog */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-sm font-black text-[#1a3461] uppercase tracking-wide mb-4">{ui.otherTopics}</h2>
          <div className="flex flex-wrap gap-2">
            {otherCategories.map((c) => (
              <Link
                key={c.slug}
                href={`/blog/${c.slug}`}
                className="bg-white border border-gray-200 text-sm font-semibold text-[#1a3461] px-4 py-2 rounded-xl hover:border-[#1a3461]/30 transition-all"
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
