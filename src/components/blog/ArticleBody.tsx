import Link from "next/link"
import { Lightbulb, TriangleAlert, ArrowRight } from "lucide-react"
import { anchorId } from "@/lib/blog"
import type { Block } from "@/data/blog/types"
import LiveJobs from "./LiveJobs"

function Callout({ tone, title, text }: { tone: "tip" | "warn"; title: string; text: string }) {
  const isWarn = tone === "warn"
  const Icon = isWarn ? TriangleAlert : Lightbulb
  return (
    <aside
      className={`my-6 rounded-2xl border p-5 flex gap-3 ${
        isWarn ? "bg-red-50 border-red-100" : "bg-blue-50 border-blue-100"
      }`}
    >
      <Icon size={18} className={`shrink-0 mt-0.5 ${isWarn ? "text-red-600" : "text-blue-600"}`} />
      <div>
        <p className={`font-bold text-sm mb-1 ${isWarn ? "text-red-900" : "text-[#1a3461]"}`}>{title}</p>
        <p className={`text-sm leading-relaxed ${isWarn ? "text-red-800" : "text-slate-700"}`}>{text}</p>
      </div>
    </aside>
  )
}

function Table({ caption, head, rows }: { caption?: string; head: string[]; rows: string[][] }) {
  return (
    <figure className="my-6">
      {caption && <figcaption className="text-xs font-semibold text-gray-500 mb-2">{caption}</figcaption>}
      {/* Wide tables scroll inside their own container so the page never scrolls sideways */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200">
        <table className="w-full text-sm border-collapse min-w-[520px]">
          <thead>
            <tr className="bg-gray-50">
              {head.map((h, i) => (
                <th key={i} className="text-left font-bold text-[#1a3461] px-4 py-3 border-b border-gray-200">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="even:bg-gray-50/60">
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className={`px-4 py-3 border-b border-gray-100 align-top ${
                      j === 0 ? "font-semibold text-slate-800" : "text-slate-600"
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  )
}

export default function ArticleBody({ blocks }: { blocks: Block[] }) {
  return (
    <div>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "h2":
            return (
              <h2
                key={i}
                id={anchorId(block.text)}
                className="scroll-mt-24 text-xl sm:text-2xl font-black text-[#1a3461] mt-10 mb-3"
              >
                {block.text}
              </h2>
            )
          case "h3":
            return (
              <h3
                key={i}
                id={anchorId(block.text)}
                className="scroll-mt-24 text-base sm:text-lg font-bold text-[#1a3461] mt-7 mb-2"
              >
                {block.text}
              </h3>
            )
          case "p":
            return (
              <p key={i} className="text-[15px] leading-[1.75] text-slate-700 mb-4">
                {block.text}
              </p>
            )
          case "ul":
            return (
              <ul key={i} className="my-4 space-y-2">
                {block.items.map((item, j) => (
                  <li key={j} className="flex gap-3 text-[15px] leading-relaxed text-slate-700">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#1a3461] shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )
          case "ol":
            return (
              <ol key={i} className="my-4 space-y-2.5">
                {block.items.map((item, j) => (
                  <li key={j} className="flex gap-3 text-[15px] leading-relaxed text-slate-700">
                    <span className="shrink-0 w-6 h-6 rounded-lg bg-[#1a3461]/10 text-[#1a3461] text-xs font-bold flex items-center justify-center mt-0.5">
                      {j + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            )
          case "table":
            return <Table key={i} caption={block.caption} head={block.head} rows={block.rows} />
          case "callout":
            return <Callout key={i} tone={block.tone} title={block.title} text={block.text} />
          case "cta":
            return (
              <div
                key={i}
                className="my-7 rounded-2xl bg-[#1a3461] text-white p-6 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <p className="flex-1 text-sm leading-relaxed text-blue-50">{block.text}</p>
                <Link
                  href={block.href}
                  className="inline-flex items-center justify-center gap-1.5 bg-white text-[#1a3461] text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors shrink-0"
                >
                  {block.label}
                  <ArrowRight size={15} />
                </Link>
              </div>
            )
          case "jobs":
            return (
              <LiveJobs
                key={i}
                heading={block.heading}
                categorySlug={block.categorySlug}
                citySlug={block.citySlug}
              />
            )
        }
      })}
    </div>
  )
}
