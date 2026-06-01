'use client'

const STEPS = [
  {
    n: '01',
    label: 'Tempel link',
    body: 'Salin URL Shopee. Scraper kami baca nama, kategori, harga, foto — auto.',
    note: '~3 dtk',
  },
  {
    n: '02',
    label: 'Riset & angle',
    body: 'Vision AI analisa visual produk. Tulis target market, strength, lemah, sudut UGC.',
    note: '~12 dtk',
  },
  {
    n: '03',
    label: 'Hook & konsep',
    body: '10 hook viral di-generate, lalu diranking. Top 5 yang lolos, kamu tinggal pilih.',
    note: '~8 dtk',
  },
  {
    n: '04',
    label: 'Start frame',
    body: 'Leonardo Nano Banana cetak frame pembuka. Pakai model atau produk-only.',
    note: '~45 dtk',
  },
  {
    n: '05',
    label: 'Prompt Veo3',
    body: '2 clip × 10 detik. Hook → solusi → CTA. Tinggal paste ke Veo3 / Gemini I2V.',
    note: '~22 dtk',
  },
]

export function Process() {
  return (
    <section id="proses" className="editorial grain border-t" style={{ background: 'var(--paper-warm)', borderColor: 'var(--ink)' }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
        <div className="grid grid-cols-12 gap-6 lg:gap-10 mb-14">
          <div className="col-span-12 lg:col-span-3" data-reveal>
            <p className="mono mb-3">Bagian I</p>
            <p className="serif italic text-2xl">Proses</p>
          </div>
          <h2 className="col-span-12 lg:col-span-9 display text-[clamp(2.4rem,6vw,5rem)]" data-reveal data-reveal-delay="1">
            Lima langkah,
            <br />
            <em className="it">satu cangkir kopi.</em>
          </h2>
        </div>

        <div className="space-y-0">
          {STEPS.map((s, i) => (
            <article
              key={s.n}
              className="grid grid-cols-12 gap-4 lg:gap-10 py-10 lg:py-14 border-t last:border-b"
              style={{ borderColor: 'var(--rule)' }}
              data-reveal
              data-reveal-delay={String((i % 4) + 1)}
            >
              <div className="col-span-3 md:col-span-2">
                <span className="stepnum">{s.n}</span>
              </div>

              <div className="col-span-9 md:col-span-5 lg:col-span-6">
                <h3 className="serif text-[clamp(1.6rem,2.6vw,2.4rem)] leading-tight mb-3" style={{ fontWeight: 400, letterSpacing: '-0.01em' }}>
                  {s.label}
                </h3>
                <p className="text-base lg:text-lg leading-relaxed" style={{ maxWidth: '52ch' }}>
                  {s.body}
                </p>
              </div>

              <aside className="col-span-12 md:col-span-5 lg:col-span-4 md:pl-6 md:border-l flex md:flex-col gap-4 md:gap-6 items-start" style={{ borderColor: 'var(--rule)' }}>
                <div>
                  <p className="mono mb-1">Durasi</p>
                  <p className="mono-num text-2xl serif" style={{ color: 'var(--vermilion)', fontVariationSettings: '"opsz" 144, "SOFT" 100', fontStyle: 'italic' }}>
                    {s.note}
                  </p>
                </div>
                <div className="marginnote">
                  Auto-resume kalau koneksi putus. State persisten di browser.
                </div>
              </aside>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
