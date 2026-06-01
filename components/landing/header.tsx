'use client'

import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'

const NAV = [
  { href: '#proses', label: 'Proses' },
  { href: '#fitur', label: 'Fitur' },
  { href: '#harga', label: 'Harga' },
  { href: '#tentang', label: 'Tentang' },
]

export function MagazineHeader() {
  return (
    <header className="editorial sticky top-0 z-40 grain" style={{ background: 'rgba(242,239,229,0.92)', backdropFilter: 'blur(8px)' }}>
      <div className="border-b" style={{ borderColor: 'var(--ink)' }}>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex items-center justify-between gap-6 py-3">
          <div className="flex items-center gap-4">
            <span className="mono">Vol. 01 / Edisi 24</span>
            <span className="hidden md:inline mono">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="mono hidden md:inline">Jakarta · 28°C</span>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-5 flex items-end justify-between gap-8">
        <Link href="/" className="display text-[2.6rem] md:text-[3.4rem] leading-none" style={{ letterSpacing: '-0.05em' }}>
          Pineapple<span className="it" style={{ color: 'var(--vermilion)' }}>.</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="swap-link mono">
              <span>{n.label}</span>
              <span aria-hidden>{n.label}</span>
            </a>
          ))}
        </nav>

        <Link href="/dashboard/new" className="btn">
          Buka Studio
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
          </svg>
        </Link>
      </div>
      <div className="rule-thick" style={{ background: 'var(--ink)' }} />
    </header>
  )
}
