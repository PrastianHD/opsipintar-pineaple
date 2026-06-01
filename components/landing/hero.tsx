'use client'

import Link from 'next/link'

export function Hero() {
  return (
    <section className="editorial grain relative overflow-hidden" style={{ background: 'var(--paper)' }}>
      {/* Decorative vertical rule */}
      <div className="hidden lg:block absolute top-0 bottom-0" style={{ left: '32%', width: 1, background: 'var(--rule)' }} />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-10 lg:py-16">
        {/* Issue meta strip */}
        <div className="flex items-center justify-between mb-12 lg:mb-16" data-reveal>
          <div className="flex items-center gap-6">
            <span className="mono">Manifesto</span>
            <span className="rule" style={{ width: 60 }} />
            <span className="mono">No. 001</span>
          </div>
          <span className="mono hidden md:inline">Cetakan terbatas · 2026</span>
        </div>

        <div className="grid grid-cols-12 gap-6 lg:gap-10 items-end">
          {/* Left rail — meta */}
          <aside className="col-span-12 lg:col-span-3 space-y-6 lg:pt-2 order-2 lg:order-1">
            <div data-reveal>
              <p className="mono mb-3">Subyek</p>
              <p className="serif text-lg leading-snug" style={{ fontStyle: 'italic', fontWeight: 400 }}>
                Studio konten otomatis untuk brand kreatif yang menolak template basi.
              </p>
            </div>
            <div className="rule" />
            <div data-reveal data-reveal-delay="1">
              <p className="mono mb-3">Bahan baku</p>
              <ul className="space-y-1.5 text-sm" style={{ color: 'var(--ink)' }}>
                <li>· Link Shopee — 1 baris</li>
                <li>· Foto produk — auto</li>
                <li>· Suara brand — opsional</li>
              </ul>
            </div>
            <div className="rule" />
            <div data-reveal data-reveal-delay="2">
              <p className="mono mb-3">Hasil</p>
              <ul className="space-y-1.5 text-sm">
                <li>· 5 hook viral terurut</li>
                <li>· 1 start frame sinematik</li>
                <li>· 2 prompt video Veo3</li>
              </ul>
            </div>
          </aside>

          {/* Center headline */}
          <div className="col-span-12 lg:col-span-9 order-1 lg:order-2">
            <h1 className="display text-[clamp(3.4rem,11vw,9.4rem)]" data-reveal>
              Konten <em className="it">UGC</em>,
              <br />
              dijahit tangan
              <br />
              <span style={{ color: 'var(--ink-soft)' }}>oleh</span> <em className="it">mesin</em>.
            </h1>

            <div className="mt-10 lg:mt-12 grid grid-cols-12 gap-6">
              <p className="col-span-12 md:col-span-7 dropcap text-[1.05rem] leading-[1.7]" data-reveal data-reveal-delay="1">
                Dulu satu video UGC butuh model, lokasi, kru, dan tiga hari kerja.
                Sekarang kamu cukup tempel link Shopee. Kami baca produknya, riset
                target marketnya, tulis hook viralnya, lalu cetak prompt video
                yang siap dieksekusi Veo3 atau Gemini I2V — semuanya dalam{' '}
                <span className="mark" style={{ fontWeight: 600 }}>90 detik</span>.
              </p>

              <div className="col-span-12 md:col-span-5 md:pl-6 md:border-l space-y-4" style={{ borderColor: 'var(--ink)' }} data-reveal data-reveal-delay="2">
                <div className="flex items-center gap-3 flex-wrap">
                  <Link href="/dashboard/new" className="btn">
                    Mulai produksi
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                    </svg>
                  </Link>
                  <a href="#proses" className="btn btn-ghost">Lihat proses</a>
                </div>
                <p className="mono leading-relaxed" style={{ opacity: 0.8 }}>
                  Tanpa kartu kredit · 5 produksi gratis · BYO API key
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hand-drawn arrow annotation */}
      <svg
        aria-hidden
        className="hidden lg:block absolute"
        style={{ right: '5%', top: '38%', width: 140, height: 90, color: 'var(--vermilion)', opacity: 0.7 }}
        viewBox="0 0 140 90"
        fill="none"
      >
        <path
          d="M5 70 Q 50 10, 130 18"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="0 0"
        />
        <path d="M125 10 L 132 18 L 122 25" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />
        <text x="40" y="85" fontFamily="var(--font-mono)" fontSize="10" fill="currentColor" letterSpacing="0.1em">90 dtk</text>
      </svg>
    </section>
  )
}
