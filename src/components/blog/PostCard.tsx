import { Link } from "@/i18n/navigation"
import { Clock } from "lucide-react"
import { formatPostDate, postUrl, readingMinutes, getBlogCategory, localizeCategory } from "@/lib/blog"
import type { LocalizedPost } from "@/lib/blog"
import { blogUi } from "@/data/blog/ui"

type Props = {
  post: LocalizedPost
  showCategory?: boolean
  /** Locale of the page the card sits on — drives the "English" badge on Hindi pages. */
  pageLang?: "en" | "hi"
}

export default function PostCard({ post, showCategory = true, pageLang = "en" }: Props) {
  const base = getBlogCategory(post.category)
  const category = base ? localizeCategory(base, post.lang) : undefined
  const ui = blogUi(post.lang)
  // A Hindi listing that contains an untranslated (English) card should say so.
  const showEnglishBadge = pageLang === "hi" && post.lang === "en"

  return (
    <article
      lang={post.lang}
      className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-[#1a3461]/20 transition-all flex flex-col"
    >
      <div className="flex items-center gap-2 mb-2">
        {showCategory && category && (
          <Link
            href={`/blog/${category.slug}`}
            className="text-[11px] font-bold uppercase tracking-wide text-blue-600 hover:text-blue-700"
          >
            {category.label}
          </Link>
        )}
        {showEnglishBadge && (
          <span className="text-[10px] font-bold uppercase tracking-wide text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
            {blogUi("hi").englishBadge}
          </span>
        )}
      </div>

      <h2 className="font-bold text-[#1a3461] leading-snug mb-2">
        <Link href={postUrl(post)} className="hover:text-blue-700 transition-colors">
          {post.title}
        </Link>
      </h2>

      <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 flex-1">{post.excerpt}</p>

      <div className="flex items-center gap-3 mt-4 text-xs text-gray-400">
        <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt, post.lang)}</time>
        <span className="inline-flex items-center gap-1">
          <Clock size={12} />
          {ui.readTime(readingMinutes(post))}
        </span>
      </div>
    </article>
  )
}
