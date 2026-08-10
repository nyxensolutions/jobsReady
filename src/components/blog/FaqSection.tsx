import { ChevronDown } from "lucide-react"
import { anchorId } from "@/lib/blog"
import type { Faq } from "@/data/blog/types"

/**
 * Native <details> accordion — no client JS, so the answers are present in the
 * server-rendered HTML and remain crawlable while staying collapsed for readers.
 */
export default function FaqSection({ faqs }: { faqs: Faq[] }) {
  if (faqs.length === 0) return null

  return (
    <section className="mt-10">
      <h2 id="faqs" className="scroll-mt-24 text-xl sm:text-2xl font-black text-[#1a3461] mb-4">
        Frequently Asked Questions
      </h2>
      <div className="space-y-2">
        {faqs.map((faq, i) => (
          <details
            key={i}
            id={anchorId(faq.q)}
            className="group rounded-xl border border-gray-200 bg-white overflow-hidden scroll-mt-24"
          >
            <summary className="flex items-start justify-between gap-3 cursor-pointer list-none px-5 py-4 hover:bg-gray-50 transition-colors">
              <h3 className="text-sm font-bold text-[#1a3461] leading-snug">{faq.q}</h3>
              <ChevronDown
                size={16}
                className="shrink-0 mt-0.5 text-gray-400 transition-transform group-open:rotate-180"
              />
            </summary>
            <p className="px-5 pb-4 text-sm leading-relaxed text-slate-600">{faq.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
