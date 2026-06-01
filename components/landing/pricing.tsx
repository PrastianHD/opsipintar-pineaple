'use client'

import Link from 'next/link'

const PLANS = [
  {
    no: '01',
    name: 'Pemula',
    price: 'Gratis',
    suffix: '',
    desc: 'Cukup untuk mencoba.',
    perks: ['5 produksi / bulan', 'Hook ranker', 'Start frame standar', 'Dukungan komunitas'],
    cta: 'Mulai gratis',
    href: '/dashboard/new',
    accent: false,
  },
  {
    no: '02',
    name: 'Kreator',
    price: 'Rp 299',
    suffix: 'k / bln',
    desc: 'Untuk yang serius scaling.',
    perks: ['Tak terbatas', 'A/B otomatis', 'Resume per-step', 'Reference clone', 'Email prioritas'],
    cta: 'Coba 7 hari',
    href: '/dashboard/new',
    accent: true,
  },
  {
    no: '03',
    name: 'Studio',
    price: 'Custom',
    suffix: '',
    desc: 'Agensi & tim produksi.',
    perks: ['Semua di Kreator', 'White-label', 'API akses', 'Akun manager', 'SLA 24/7'],
    cta: 'Hubungi kami',
    href: 'mailto:halo@pineapple.id',
    accent: false,
  },
]

export function Pricing() {
  return (
    <section id="harga" className="editorial border-t" style={{ background: 'var(--paper)', borderColor: 'var(--ink)' }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
        <header className="grid grid-cols-12 gap-6 lg:gap-10 mb-16">
          <div className="col-span-12 lg:col-span-3" data-reveal>
            <p className="mono mb-3">Bagian IV</p>
            <p className="serif italic text-2xl">Tarif</p>
          </div>
          <h2 className="col-span-12 lg:col-span-9 display text-[clamp(2.4rem,6vw,5rem)]" data-reveal data-reveal-delay="1">
            Bayar sekali,
            <br />
            <em className="it">pakai sepuasnya.</em>
          </h2>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-b" style={{ borderColor: 'var(--ink)' }}>
          {PLANS.map((p, i) => (
            <article
              key={p.no}
              className={`p-8 lg:p-12 relative md:[&:nth-child(n+2)]:border-l flex flex-col`}
              style={{
                borderColor: 'var(--rule)',
                background: p.accent ? 'var(--ink)' : 'transparent',
                color: p.accent ? 'var(--paper)' : 'var(--ink)',
              }}
              data-reveal
              data-reveal-delay={String(i + 1)}
            >
              {p.accent && (
                <div
                  className="absolute -top-px left-0 right-0 mono py-1.5 text-center"
                  style={{
                    background: 'var(--vermilion)',
                    color: 'var(--paper)',
                    transform: 'translateY(-100%)',
                    letterSpacing: '0.18em',
                  }}
                >
                  ★ Pilihan editor
                </div>
              )}

              <div className="flex items-baseline justify-between mb-8">
                <span className="mono" style={{ color: p.accent ? 'var(--gold)' : 'var(--vermilion)' }}>
                  No. {p.no}
                </span>
                <span className="mono" style={{ opacity: 0.7 }}>{p.desc}</span>
              </div>

              <h3 className="serif text-4xl mb-2" style={{ fontWeight: 400, letterSpacing: '-0.02em' }}>
                {p.name}
              </h3>

              <div className="mb-8 flex items-baseline gap-1">
                <span className="display text-[3.5rem] leading-none" style={{ color: p.accent ? 'var(--gold)' : 'var(--vermilion)' }}>
                  {p.price}
                </span>
                {p.suffix && <span className="mono">{p.suffix}</span>}
              </div>

              <ul className="space-y-2.5 mb-10 flex-1">
                {p.perks.map((perk) => (
                  <li key={perk} className="flex gap-3 text-[0.95rem]">
                    <span className="mono mt-1" style={{ color: p.accent ? 'var(--gold)' : 'var(--vermilion)', opacity: 1 }}>+</span>
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={p.href}
                className="btn"
                style={
                  p.accent
                    ? { background: 'var(--gold)', borderColor: 'var(--gold)', color: 'var(--ink)' }
                    : { background: 'transparent', color: 'var(--ink)', borderColor: 'var(--ink)' }
                }
              >
                {p.cta}
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                </svg>
              </Link>
            </article>
          ))}
        </div>

        <p className="mono text-center mt-10" style={{ opacity: 0.7 }}>
          Semua paket include: BYO API key (OpenRouter + Leonardo) · Token tracking · Tidak ada lock-in
        </p>
      </div>
    </section>
  )
}
