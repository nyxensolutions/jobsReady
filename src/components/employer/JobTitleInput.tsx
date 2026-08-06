"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Search, X, ChevronDown } from "lucide-react"
import JOB_TITLES from "@/data/job-titles"

interface Props {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

const MAX_RESULTS = 8

export default function JobTitleInput({
  value,
  onChange,
  placeholder = "Search job title…",
}: Props) {
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // Filtered suggestions
  const suggestions = query.trim().length >= 1
    ? JOB_TITLES.filter((t) =>
        t.toLowerCase().includes(query.trim().toLowerCase())
      ).slice(0, MAX_RESULTS)
    : []

  // Sync external value → local query when controlled externally (chip click)
  useEffect(() => {
    setQuery(value)
  }, [value])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setActiveIdx(-1)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Scroll active item into view
  useEffect(() => {
    if (activeIdx >= 0 && listRef.current) {
      const item = listRef.current.children[activeIdx] as HTMLElement
      item?.scrollIntoView({ block: "nearest" })
    }
  }, [activeIdx])

  const select = useCallback((title: string) => {
    setQuery(title)
    onChange(title)
    setOpen(false)
    setActiveIdx(-1)
    inputRef.current?.blur()
  }, [onChange])

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    setQuery(v)
    onChange(v)           // free-text is also valid
    setOpen(true)
    setActiveIdx(-1)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) {
      if (e.key === "ArrowDown") { setOpen(true); setActiveIdx(0) }
      return
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1))
        break
      case "ArrowUp":
        e.preventDefault()
        setActiveIdx((i) => Math.max(i - 1, 0))
        break
      case "Enter":
        e.preventDefault()
        if (activeIdx >= 0) select(suggestions[activeIdx])
        else setOpen(false)
        break
      case "Escape":
        setOpen(false)
        setActiveIdx(-1)
        break
    }
  }

  function clear() {
    setQuery("")
    onChange("")
    setOpen(false)
    inputRef.current?.focus()
  }

  const showDropdown = open && suggestions.length > 0

  return (
    <div ref={containerRef} className="relative">
      {/* Input */}
      <div
        className={`flex items-center gap-2 w-full px-4 py-3 border rounded-xl bg-white transition-all ${
          open
            ? "border-[#1a3461] ring-2 ring-[#1a3461]/20"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <Search size={14} className="text-gray-400 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInput}
          onFocus={() => { if (query.trim()) setOpen(true) }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          className="flex-1 text-sm text-gray-800 outline-none placeholder-gray-400 bg-transparent"
        />
        {query ? (
          <button
            type="button"
            onClick={clear}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={-1}
          >
            <X size={14} />
          </button>
        ) : (
          <ChevronDown
            size={14}
            className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          />
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto"
        >
          {suggestions.map((title, idx) => {
            // Bold the matching substring
            const lower = title.toLowerCase()
            const q = query.trim().toLowerCase()
            const matchStart = lower.indexOf(q)
            const matchEnd = matchStart + q.length
            const before = title.slice(0, matchStart)
            const match = title.slice(matchStart, matchEnd)
            const after = title.slice(matchEnd)

            return (
              <li
                key={title}
                role="option"
                aria-selected={idx === activeIdx}
                onMouseDown={(e) => { e.preventDefault(); select(title) }}
                onMouseEnter={() => setActiveIdx(idx)}
                className={`flex items-center gap-2.5 px-4 py-2.5 cursor-pointer text-sm transition-colors ${
                  idx === activeIdx
                    ? "bg-[#1a3461]/5 text-[#1a3461]"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Search size={12} className="text-gray-300 shrink-0" />
                <span>
                  {before}
                  <span className="font-semibold text-[#1a3461]">{match}</span>
                  {after}
                </span>
              </li>
            )
          })}
          {/* Free-text hint if typed value not in list */}
          {query.trim() && !suggestions.some(s => s.toLowerCase() === query.trim().toLowerCase()) && (
            <li
              onMouseDown={(e) => { e.preventDefault(); select(query.trim()); setOpen(false) }}
              className="flex items-center gap-2.5 px-4 py-2.5 cursor-pointer text-sm text-gray-500 hover:bg-gray-50 border-t border-gray-100"
            >
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full shrink-0">custom</span>
              Use &ldquo;<span className="font-medium text-gray-700">{query.trim()}</span>&rdquo;
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
