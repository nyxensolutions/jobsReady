"use client"

import { useEffect, useRef, useState } from "react"
import { Plus, X, Loader2 } from "lucide-react"

interface Suggestion {
  slug: string
  name: string
  nameHi: string | null
  categories: string[]
}

interface Props {
  value: string[]
  onChange: (next: string[]) => void
  /** A Category slug to prefer in the ranking, when one is known. */
  category?: string | null
  placeholder?: string
  inputClassName?: string
}

/**
 * Skill picker backed by the shared vocabulary in /api/skills.
 *
 * Free text is still accepted. The vocabulary will never cover every trade in
 * the country, and refusing an unlisted skill would lose information that is
 * true about the person — so an unmatched entry is kept rather than blocked.
 * Matching simply does less for it, which is the honest outcome.
 */
export default function SkillAutocomplete({
  value,
  onChange,
  category,
  placeholder = "Start typing — e.g. driving, excel, cooking",
  inputClassName = "",
}: Props) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [highlight, setHighlight] = useState(0)
  const boxRef = useRef<HTMLDivElement>(null)

  // Debounced so a fast typist does not fire a request per keystroke.
  useEffect(() => {
    if (!open) return
    const id = setTimeout(async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({ q: query, limit: "8" })
        if (category) params.set("category", category)
        const res = await fetch(`/api/skills?${params}`)
        const data = await res.json()
        setSuggestions(Array.isArray(data.skills) ? data.skills : [])
        setHighlight(0)
      } catch {
        // The field still works as free text without suggestions.
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 180)
    return () => clearTimeout(id)
  }, [query, category, open])

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [])

  const visible = suggestions.filter(
    (s) => !value.some((v) => v.toLowerCase() === s.name.toLowerCase())
  )

  function add(skill: string) {
    const v = skill.trim()
    if (!v) return
    if (!value.some((x) => x.toLowerCase() === v.toLowerCase())) onChange([...value, v])
    setQuery("")
    setSuggestions([])
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlight((h) => Math.min(h + 1, visible.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlight((h) => Math.max(h - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      // Enter takes the highlighted suggestion when one is showing, and the
      // raw text otherwise — so the keyboard path never traps someone whose
      // skill is not in the list.
      add(visible[highlight] ? visible[highlight].name : query)
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  return (
    <div ref={boxRef} className="relative">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 text-sm"
            >
              {s}
              <button
                type="button"
                aria-label={`Remove ${s}`}
                onClick={() => onChange(value.filter((x) => x !== s))}
                className="text-blue-400 hover:text-blue-700"
              >
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className={inputClassName}
        />
        <button
          type="button"
          onClick={() => add(query)}
          className="px-3 py-2.5 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 shrink-0"
          aria-label="Add skill"
        >
          <Plus size={16} />
        </button>
      </div>

      {open && (visible.length > 0 || loading) && (
        <ul className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-auto py-1">
          {loading && visible.length === 0 && (
            <li className="px-3 py-2 text-sm text-gray-400 flex items-center gap-2">
              <Loader2 size={13} className="animate-spin" /> Searching…
            </li>
          )}
          {visible.map((s, i) => (
            <li key={s.slug}>
              <button
                type="button"
                onMouseEnter={() => setHighlight(i)}
                onClick={() => add(s.name)}
                className={`w-full text-left px-3 py-2 text-sm ${
                  i === highlight ? "bg-blue-50 text-blue-900" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {s.name}
                {s.nameHi && <span className="text-gray-400 ml-2">{s.nameHi}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
