'use client'

import Link from 'next/link'

const COLOPHON = [
  ['Edisi', 'Volume 01 — No. 001'],
  ['Cetakan', 'Mei 2026'],
  ['Tipografi', 'Fraunces · DM Sans · JetBrains Mono'],
  ['Palet', 'Tinta · Kertas · Vermilion · Emas'],
  ['Mesin', 'OpenRouter · Leonardo Nano Banana · Veo3'],
  ['Bahasa', 'Indonesia (Jakarta-Yogya hybrid)'],
  ['Lisensi', '© 2026 Pineapple Studio'],
]

export function Footer() {
  return (
    <footer className="editorial border-t grain" style={{ background: 'var(--paper-warm)', borderColor: 'var(--ink)' }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-24">
        <div className="grid grid-cols-12 gap-6 lg:gap-10">
          {/* Final CTA */}
          <div className="col-span-12 lg:col-span-7 lg:border-r lg:pr-10" style={{ borderColor: 'var(--rule)' }}>
            <p className="mono mb-4">Edisi terakhir</p>
            <h3 className="display text-[clamp(2.4rem,6vw,4.4rem)] mb-8" data-reveal>
              Selesai baca?
              <br />
              Saatnya <em className="it">cetak</em>.
            </h3>
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard/new" className="btn">
                Mulai produksi pertama
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                </svg>
              </Link>
              <a href="mailto:halo@pineapple.id" className="btn btn-ghost">
                Email kami
              </a>
            </div>
          </div>

          {/* Colophon */}
          <div id="tentang" className="col-span-12 lg:col-span-5">
            <p className="mono mb-4">Kolofon</p>
            <h3 className="serif italic text-2xl mb-6" style={{ fontWeight: 400 }}>
              Tentang publikasi ini
            </h3>
            <dl className="text-sm">
              {COLOPHON.map(([k, v]) => (
                <div key={k} className="grid grid-cols-12 gap-4 py-2.5 border-t" style={{ borderColor: 'var(--rule)' }}>
                  <dt className="col-span-4 mono">{k}</dt>
                  <dd className="col-span-8 serif" style={{ fontWeight: 400 }}>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mt-16 pt-6 border-t flex flex-col md:flex-row items-start md:items-center justify-between gap-4" style={{ borderColor: 'var(--ink)' }}>
          <p className="display text-3xl">
            Pineapple<span className="it" style={{ color: 'var(--vermilion)' }}>.</span>
          </p>
          <p className="mono">Dijahit di Jakarta · Diterbitkan untuk Indonesia</p>
          <div className="flex gap-6">
            {['Twitter', 'Instagram', 'LinkedIn'].map((s) => (
              <a key={s} href="#" className="swap-link mono">
                <span>{s}</span>
                <span aria-hidden>↗ {s}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
