import Link from "next/link"
import { Clock } from "lucide-react"
import { formatPostDate, postUrl, readingMinutes, getBlogCategory } from "@/lib/blog"
import type { BlogPost } from "@/data/blog/types"

export default function PostCard({ post, showCategory = true }: { post: BlogPost; showCategory?: boolean }) {
  const category = getBlogCategory(post.category)

  return (
    <article className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-[#1a3461]/20 transition-all flex flex-col">
      {showCategory && category && (
        <Link
          href={`/blog/${category.slug}`}
          className="self-start text-[11px] font-bold uppercase tracking-wide text-blue-600 hover:text-blue-700 mb-2"
        >
          {category.label}
        </Link>
      )}

      <h2 className="font-bold text-[#1a3461] leading-snug mb-2">
        <Link href={postUrl(post)} className="hover:text-blue-700 transition-colors">
          {post.title}
        </Link>
      </h2>

      <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 flex-1">{post.excerpt}</p>

      <div className="flex items-center gap-3 mt-4 text-xs text-gray-400">
        <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
        <span className="inline-flex items-center gap-1">
          <Clock size={12} />
          {readingMinutes(post)} min read
        </span>
      </div>
    </article>
  )
}
