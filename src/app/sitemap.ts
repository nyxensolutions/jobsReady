import { MetadataRoute } from "next"
import { prisma } from "@/lib/db"
import { SITE_URL, languageAlternates, contentAlternates } from "@/lib/seo"
import { getAllPosts, BLOG_CATEGORIES, translatedLocales, categoryHasHindi, anyHindi } from "@/lib/blog"

export const dynamic = "force-dynamic"

const APP_URL = SITE_URL

/** Every URL carries its hreflang set so the 8 locales are never read as duplicates. */
function withAlternates(path: string) {
  return { languages: languageAlternates(path) }
}

type SitemapMeta = Pick<MetadataRoute.Sitemap[number], "lastModified" | "changeFrequency" | "priority">

/**
 * Sitemap entries for a page that exists in English plus some translated locales.
 * Each URL lists the same hreflang set, so the English and Hindi pages point at
 * each other and neither is read as a duplicate of the other.
 */
function blogEntries(path: string, translated: string[], meta: SitemapMeta): MetadataRoute.Sitemap {
  const { languages } = contentAlternates("en", path, translated)
  const urls = [`${APP_URL}${path}`, ...translated.map((locale) => `${APP_URL}/${locale}${path}`)]
  return urls.map((url) => ({ url, ...meta, alternates: { languages } }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // A DB blip must not take down the whole sitemap — static and blog routes
  // are known without a query, so serve those rather than returning a 500.
  let jobs: Array<{ id: string; updatedAt: Date }> = []
  try {
    jobs = await prisma.jobListing.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 5000,
    })
  } catch {
    jobs = []
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: APP_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1, alternates: withAlternates("/") },
    { url: `${APP_URL}/jobs`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9, alternates: withAlternates("/jobs") },
    { url: `${APP_URL}/categories`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8, alternates: withAlternates("/categories") },
    { url: `${APP_URL}/cities`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8, alternates: withAlternates("/cities") },
    ...blogEntries("/blog", anyHindi() ? ["hi"] : [], { lastModified: new Date(), changeFrequency: "daily", priority: 0.8 }),
    { url: `${APP_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5, alternates: withAlternates("/about") },
    { url: `${APP_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5, alternates: withAlternates("/contact") },
    { url: `${APP_URL}/employer/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6, alternates: withAlternates("/employer/register") },
    { url: `${APP_URL}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3, alternates: withAlternates("/privacy") },
    { url: `${APP_URL}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3, alternates: withAlternates("/terms") },
  ]

  // Only list blog categories that actually have posts — empty pages waste crawl budget.
  const posts = getAllPosts()
  const blogCategoryRoutes: MetadataRoute.Sitemap = BLOG_CATEGORIES.filter((category) =>
    posts.some((post) => post.category === category.slug)
  ).flatMap((category) =>
    blogEntries(`/blog/${category.slug}`, categoryHasHindi(category.slug) ? ["hi"] : [], {
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    })
  )

  // English URL for every post, plus a /hi/ URL (cross-linked by hreflang) for each one
  // that has a real Hindi translation. Untranslated locales are deliberately not listed.
  const blogPostRoutes: MetadataRoute.Sitemap = posts.flatMap((post) =>
    blogEntries(`/blog/${post.category}/${post.slug}`, translatedLocales(post.slug), {
      lastModified: new Date(post.updatedAt ?? post.publishedAt),
      changeFrequency: "monthly",
      priority: 0.7,
    })
  )

  // Job routes — include hreflang alternates so Google doesn't treat
  // /hi/jobs/123 and /jobs/123 as duplicates of each other.
  const jobRoutes: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: `${APP_URL}/jobs/${job.id}`,
    lastModified: job.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
    alternates: withAlternates(`/jobs/${job.id}`),
  }))

  return [...staticRoutes, ...blogCategoryRoutes, ...blogPostRoutes, ...jobRoutes]
}
