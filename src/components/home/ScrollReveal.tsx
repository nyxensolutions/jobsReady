"use client"

import { useEffect, useRef, type ReactNode, type ElementType } from "react"

type Animation = "fadeUp" | "fadeIn" | "slideLeft" | "slideRight" | "zoomIn" | "popIn"

interface Props {
  children: ReactNode
  animation?: Animation
  delay?: number        // ms
  stagger?: number      // if set, applies stagger-N class based on index
  className?: string
  as?: ElementType
  threshold?: number    // 0-1, default 0.1
}

export default function ScrollReveal({
  children,
  animation = "fadeUp",
  delay,
  stagger,
  className = "",
  as: Tag = "div",
  threshold = 0.1,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Respect reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.remove("scroll-hidden")
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.remove("scroll-hidden")
          el.classList.add(`scroll-reveal-${animation}`)
          observer.unobserve(el)
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [animation, threshold])

  const staggerClass = stagger !== undefined ? `stagger-${Math.min(stagger + 1, 12)}` : ""
  const style = delay ? { animationDelay: `${delay}ms` } : undefined

  return (
    // @ts-expect-error dynamic tag
    <Tag
      ref={ref}
      className={`scroll-hidden ${staggerClass} ${className}`}
      style={style}
    >
      {children}
    </Tag>
  )
}
