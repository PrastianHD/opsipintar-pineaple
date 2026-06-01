'use client'

// Mock specimen page — shows actual output of the studio
const HOOKS = [
  'Skincare ini bukan hype, tapi hasil',
  'Pori-pori gw pensiun setelah pakai ini',
  'Gak nyangka harga 50ribu sebagus ini',
  'Mantan bilang glow up gw mencurigakan',
  'Ini bukan ad — ini intervensi',
]

export function Specimen() {
  return (
    <section className="editorial border-t grain" style={{ background: 'var(--paper-warm)', borderColor: 'var(--ink)' }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
        <header className="grid grid-cols-12 gap-6 lg:gap-10 mb-14">
          <div className="col-span-12 lg:col-span-3" data-reveal>
            <p className="mono mb-3">Bagian III</p>
            <p className="serif italic text-2xl">Spesimen</p>
          </div>
          <h2 className="col-span-12 lg:col-span-9 display text-[clamp(2.4rem,6vw,5rem)]" data-reveal data-reveal-delay="1">
            Lihat <em className="it">apa</em> yang
            <br />
            sebenarnya keluar.
          </h2>
        </header>

        <div className="grid grid-cols-12 gap-6 lg:gap-10">
          {/* Left: Mock browser frame */}
          <div className="col-span-12 lg:col-span-7" data-reveal>
            <div className="relative" style={{ background: 'var(--paper)', border: '1px solid var(--ink)' }}>
              {/* Top bar */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: 'var(--ink)' }}>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--vermilion)' }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--gold)' }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--ink)', opacity: 0.4 }} />
                </div>
                <span className="mono">studio.pineapple.id/task/9F4A</span>
                <span className="mono" style={{ color: 'var(--vermilion)' }}>● rec</span>
              </div>

              {/* Body — fake start frame */}
              <div className="aspect-[3/4] relative overflow-hidden">
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background:
                      'radial-gradient(60% 40% at 35% 30%, rgba(217,164,65,0.45) 0%, transparent 60%), radial-gradient(70% 50% at 70% 80%, rgba(200,85,61,0.35) 0%, transparent 60%), linear-gradient(180deg, #2a2018 0%, #15100b 100%)',
                  }}
                />
                {/* Frame markers */}
                <div className="absolute top-3 left-3 mono" style={{ color: 'var(--paper)', opacity: 0.7 }}>FRAME 01 · 0.0s</div>
                <div className="absolute top-3 right-3 mono" style={{ color: 'var(--paper)', opacity: 0.7 }}>1080 × 1920</div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="mono" style={{ color: 'var(--paper)', opacity: 0.7 }}>iso 200 · f/1.8 · 1/60</span>
                  <span className="mono" style={{ color: 'var(--gold)' }}>● live</span>
                </div>
                {/* Crosshair */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
                  <line x1="50%" y1="0" x2="50%" y2="100%" stroke="rgba(242,239,229,0.1)" strokeDasharray="4 6" />
                  <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(242,239,229,0.1)" strokeDasharray="4 6" />
                </svg>
              </div>
            </div>
            <p className="mono mt-3" style={{ opacity: 0.7 }}>
              Fig. 01 — start frame yang dihasilkan Leonardo Nano Banana, prompt full di task detail.
            </p>
          </div>

          {/* Right: Hook ranking spec sheet */}
          <div className="col-span-12 lg:col-span-5" data-reveal data-reveal-delay="2">
            <div className="flex items-baseline justify-between mb-4">
              <p className="mono" style={{ color: 'var(--vermilion)' }}>Output No. 03</p>
              <p className="mono">5 dari 10 hook</p>
            </div>
            <h4 className="serif text-3xl mb-6" style={{ fontWeight: 400, letterSpacing: '-0.01em' }}>
              Hook viral, sudah diranking.
            </h4>

            <ol className="space-y-0">
              {HOOKS.map((h, i) => (
                <li key={i} className="spec-row items-baseline">
                  <span className="display text-3xl" style={{ fontStyle: 'italic', color: 'var(--vermilion)', lineHeight: 1 }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="serif text-base lg:text-lg leading-snug" style={{ fontWeight: 400 }}>
                    "{h}"
                  </span>
                </li>
              ))}
            </ol>

            <div className="marginnote mt-6">
              Ranking dihitung di server. Top 5 dipilih AI berdasarkan curiosity gap, emosi, spesifik, dan stop-scroll. Sisanya tetap diserahkan kalau kamu mau eksperimen.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
