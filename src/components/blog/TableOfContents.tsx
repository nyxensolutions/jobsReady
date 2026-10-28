import type { TocEntry } from "@/lib/blog"
import { blogUi, type ContentLang } from "@/data/blog/ui"

/**
 * Anchor-linked contents list. Plain <a> links (not next/link) — these are
 * in-page fragments, and they are also what Google uses to build sitelinks
 * for the article in search results.
 */
export default function TableOfContents({ entries, lang = "en" }: { entries: TocEntry[]; lang?: ContentLang }) {
  if (entries.length < 3) return null
  const ui = blogUi(lang)

  return (
    <nav aria-label="Table of contents" className="my-6 rounded-2xl border border-gray-200 bg-white p-5">
      <h2 className="text-sm font-black text-[#1a3461] uppercase tracking-wide mb-3">{ui.toc}</h2>
      <ol className="space-y-1.5">
        {entries.map((entry) => (
          <li key={entry.id} className={entry.level === 3 ? "pl-4" : ""}>
            <a
              href={`#${entry.id}`}
              className="text-sm text-slate-600 hover:text-blue-700 hover:underline leading-snug"
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
