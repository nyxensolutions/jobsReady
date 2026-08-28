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
} from "@/lib/blog"
import { alternatesFor, absoluteUrl, localePath, SITE_NAME, SITE_URL } from "@/lib/seo"
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
  const post = getPost(category, slug)
  if (!post) return {}

  const path = `/blog/${category}/${slug}`

  return {
    // Deliberately different from the <h1> — two keyword variants for one page.
    title: post.seoTitle,
    description: post.description,
    keywords: post.keywords,
    authors: [{ name: post.author }],
    alternates: alternatesFor(locale, path),
    openGraph: {
      title: post.seoTitle,
      description: post.description,
      url: absoluteUrl(localePath(locale, path)),
      type: "article",
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

  const post = getPost(categorySlug, slug)
  if (!post) notFound()

  const category = getBlogCategory(categorySlug)
  if (!category) notFound()

  const path = `/blog/${categorySlug}/${slug}`
  const url = absoluteUrl(localePath(locale, path))
  const toc = tableOfContents(post)
  const related = getRelatedPosts(post)
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
        inLanguage: locale,
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
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl(localePath(locale, "/")) },
          { "@type": "ListItem", position: 2, name: "Career Guide", item: absoluteUrl(localePath(locale, "/blog")) },
          {
            "@type": "ListItem",
            position: 3,
            name: category.label,
            item: absoluteUrl(localePath(locale, `/blog/${categorySlug}`)),
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
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1.5 text-xs text-gray-400 mb-5">
          <Link href="/" className="hover:text-[#1a3461]">Home</Link>
          <ChevronRight size={12} />
          <Link href="/blog" className="hover:text-[#1a3461]">Career Guide</Link>
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
              <span>By {post.author}</span>
              <span className="inline-flex items-center gap-1">
                <CalendarDays size={12} />
                <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock size={12} />
                {minutes} min read
              </span>
            </div>
          </header>

          <TableOfContents entries={toc} />

          <ArticleBody blocks={post.blocks} />

          <FaqSection faqs={post.faqs} />

          <ShareRow url={url} title={post.title} />
        </article>

        {/* Related posts */}
        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="text-sm font-black text-[#1a3461] uppercase tracking-wide mb-4">Related guides</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {related.map((item) => (
                <PostCard key={item.slug} post={item} />
              ))}
            </div>
          </section>
        )}

        {/* Visible breadcrumb trail at the foot, mirroring the schema */}
        <p className="mt-8 text-xs text-gray-400">
          <Link href="/" className="hover:text-[#1a3461]">Home</Link>
          {" » "}
          <Link href="/blog" className="hover:text-[#1a3461]">Career Guide</Link>
          {" » "}
          <Link href={`/blog/${categorySlug}`} className="hover:text-[#1a3461]">{category.label}</Link>
          {" » "}
          <span className="text-gray-500">{post.title}</span>
        </p>
      </div>
    </div>
  )
}
