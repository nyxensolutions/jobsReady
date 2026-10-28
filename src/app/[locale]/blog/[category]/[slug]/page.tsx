import type { Metadata } from "next"
import { Link } from "@/i18n/navigation"
import { notFound } from "next/navigation"
import { ChevronRight, Clock, CalendarDays } from "lucide-react"
import {
  getAllPosts,
  getPost,
  getBlogCategory,
  getRelatedPosts,
  tableOfContents,
  readingMinutes,
  formatPostDate,
  localizePost,
  localizeCategory,
  translatedLocales,
} from "@/lib/blog"
import { contentAlternates, absoluteUrl, localePath, SITE_NAME, SITE_URL } from "@/lib/seo"
import { blogUi } from "@/data/blog/ui"
import ArticleBody from "@/components/blog/ArticleBody"
import TableOfContents from "@/components/blog/TableOfContents"
import FaqSection from "@/components/blog/FaqSection"
import ShareRow from "@/components/blog/ShareRow"
import PostCard from "@/components/blog/PostCard"

type Props = { params: Promise<{ locale: string; category: string; slug: string }> }

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ category: post.category, slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category, slug } = await params
  const original = getPost(category, slug)
  if (!original) return {}

  const post = localizePost(original, locale)
  const path = `/blog/${category}/${slug}`
  // Canonical points at the URL whose language matches the content actually served.
  const alternates = contentAlternates(locale, path, translatedLocales(slug))

  return {
    // Deliberately different from the <h1> — two keyword variants for one page.
    title: post.seoTitle,
    description: post.description,
    keywords: post.keywords,
    authors: [{ name: post.author }],
    alternates,
    openGraph: {
      title: post.seoTitle,
      description: post.description,
      url: alternates.canonical,
      type: "article",
      locale: post.lang === "hi" ? "hi_IN" : "en_IN",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
      authors: [post.author],
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: post.seoTitle,
      description: post.description,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, category: categorySlug, slug } = await params

  const original = getPost(categorySlug, slug)
  if (!original) notFound()

  const baseCategory = getBlogCategory(categorySlug)
  if (!baseCategory) notFound()

  const post = localizePost(original, locale)
  const lang = post.lang
  const ui = blogUi(lang)
  const category = localizeCategory(baseCategory, lang)

  const path = `/blog/${categorySlug}/${slug}`
  // Structured data points at the canonical URL for the language actually being
  // served: /hi/ for a translated Hindi page, the English URL for everything else.
  const schemaLocale = lang === "hi" ? "hi" : "en"
  const url = absoluteUrl(localePath(schemaLocale, path))
  const toc = tableOfContents(post)
  const related = getRelatedPosts(original, 3, locale).map((p) => localizePost(p, locale))
  const minutes = readingMinutes(post)

  // Structured data: BlogPosting + BreadcrumbList + FAQPage, matching what the
  // strongest competitors in this niche ship on every article.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: post.title,
        description: post.description,
        keywords: post.keywords.join(", "),
        datePublished: post.publishedAt,
        dateModified: post.updatedAt ?? post.publishedAt,
        inLanguage: lang,
        author: { "@type": "Organization", name: post.author, url: SITE_URL },
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
          logo: { "@type": "ImageObject", url: absoluteUrl("/logo-full.png") },
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        articleSection: category.label,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: ui.home, item: absoluteUrl(localePath(schemaLocale, "/")) },
          { "@type": "ListItem", position: 2, name: ui.careerGuide, item: absoluteUrl(localePath(schemaLocale, "/blog")) },
          {
            "@type": "ListItem",
            position: 3,
            name: category.label,
            item: absoluteUrl(localePath(schemaLocale, `/blog/${categorySlug}`)),
          },
          { "@type": "ListItem", position: 4, name: post.title, item: url },
        ],
      },
      ...(post.faqs.length > 0
        ? [
            {
              "@type": "FAQPage",
              "@id": `${url}#faq`,
              mainEntity: post.faqs.map((faq) => ({
                "@type": "Question",
                name: faq.q,
                acceptedAnswer: { "@type": "Answer", text: faq.a },
              })),
            },
          ]
        : []),
    ],
  }

  return (
    // lang on the wrapper tells browsers/screen readers which script this content is in,
    // so Devanagari picks a proper font and Chrome doesn't offer to "translate" Hindi.
    <div lang={lang} className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1.5 text-xs text-gray-400 mb-5">
          <Link href="/" className="hover:text-[#1a3461]">{ui.home}</Link>
          <ChevronRight size={12} />
          <Link href="/blog" className="hover:text-[#1a3461]">{ui.careerGuide}</Link>
          <ChevronRight size={12} />
          <Link href={`/blog/${categorySlug}`} className="hover:text-[#1a3461]">{category.label}</Link>
        </nav>

        <article className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-8">
          <header className="mb-6">
            <Link
              href={`/blog/${categorySlug}`}
              className="text-[11px] font-bold uppercase tracking-wide text-blue-600 hover:text-blue-700"
            >
              {category.label}
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1a3461] leading-tight mt-2 mb-3">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
              <span>{ui.by} {post.author}</span>
              <span className="inline-flex items-center gap-1">
                <CalendarDays size={12} />
                <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt, lang)}</time>
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock size={12} />
                {ui.readTime(minutes)}
              </span>
            </div>
          </header>

          <TableOfContents entries={toc} lang={lang} />

          <ArticleBody blocks={post.blocks} lang={lang} />

          <FaqSection faqs={post.faqs} lang={lang} />

          <ShareRow url={url} title={post.title} lang={lang} />
        </article>

        {/* Related posts */}
        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="text-sm font-black text-[#1a3461] uppercase tracking-wide mb-4">{ui.related}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {related.map((item) => (
                <PostCard key={item.slug} post={item} pageLang={lang} />
              ))}
            </div>
          </section>
        )}

        {/* Visible breadcrumb trail at the foot, mirroring the schema */}
        <p className="mt-8 text-xs text-gray-400">
          <Link href="/" className="hover:text-[#1a3461]">{ui.home}</Link>
          {" » "}
          <Link href="/blog" className="hover:text-[#1a3461]">{ui.careerGuide}</Link>
          {" » "}
          <Link href={`/blog/${categorySlug}`} className="hover:text-[#1a3461]">{category.label}</Link>
          {" » "}
          <span className="text-gray-500">{post.title}</span>
        </p>
      </div>
    </div>
  )
}
