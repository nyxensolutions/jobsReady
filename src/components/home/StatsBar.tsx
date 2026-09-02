"use client"

import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"

const STATS = [
  { key: "jobsPosted",      value: "50,000+", emoji: "💼", color: "text-[#1a3461]" },
  { key: "citiesCovered",   value: "200+",    emoji: "🏙️", color: "text-orange-600" },
  { key: "companiesHiring", value: "5,000+",  emoji: "🏢", color: "text-emerald-600" },
  { key: "successfulHires", value: "25,000+", emoji: "✅", color: "text-purple-600"  },
]

function AnimatedCounter({ value, color }: { value: string, color: string }) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  // Parse the number and suffix
  const numMatch = value.match(/[\d,]+/)
  const targetNum = numMatch ? parseInt(numMatch[0].replace(/,/g, "")) : 0
  const suffix = value.replace(/[\d,]+/g, "")

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true)
        observer.disconnect()
      }
    }, { threshold: 0.1 })

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible || targetNum === 0) return

    let startTime: number | null = null
    const duration = 2000 // 2 seconds

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = timestamp - startTime
      const percentage = Math.min(progress / duration, 1)
      
      // easeOutQuart
      const easeProgress = 1 - Math.pow(1 - percentage, 4)
      
      setCount(Math.floor(easeProgress * targetNum))

      if (percentage < 1) {
        requestAnimationFrame(animate)
      } else {
        setCount(targetNum)
      }
    }

    requestAnimationFrame(animate)
  }, [isVisible, targetNum])

  return (
    <span ref={ref} className={`text-xl sm:text-2xl font-extrabold ${color}`}>
      {count.toLocaleString()}{suffix}
    </span>
  )
}

export default function StatsBar() {
  const t = useTranslations("home.stats")
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true)
        observer.disconnect()
      }
    }, { threshold: 0.1 })

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="bg-white border-b border-gray-100 shadow-sm" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4">
          {STATS.map((stat, i) => (
            <div
              key={stat.key}
              className={`flex flex-col items-center py-5 px-4 gap-0.5 opacity-0 ${isVisible ? 'scroll-reveal-fadeUp' : ''} stagger-${i + 1} ${
                i % 2 === 0 ? "border-r border-gray-100 sm:border-r" : ""
              } ${i < 2 ? "border-b sm:border-b-0 border-gray-100" : ""}`}
            >
              <span className="text-[11px] mb-1">{stat.emoji}</span>
              <AnimatedCounter value={stat.value} color={stat.color} />
              <span className="text-[11px] text-gray-400 text-center leading-tight">{t(stat.key as any)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
