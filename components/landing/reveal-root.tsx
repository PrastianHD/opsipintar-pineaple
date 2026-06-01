'use client'

// IntersectionObserver-driven reveal. Adds .is-visible to children with [data-reveal]
import { useEffect, useRef } from 'react'

export function RevealRoot({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    if (typeof IntersectionObserver === 'undefined') {
      root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => el.classList.add('is-visible'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible')
            io.unobserve(e.target)
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
    )
    root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return <div ref={ref}>{children}</div>
}
