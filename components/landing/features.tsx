'use client'

const FEATURES = [
  {
    tag: 'A.01',
    title: 'Hook ranker',
    body: 'Generate 10 hook gaul per produk. AI ranking sendiri pakai 4 metrik: curiosity gap, emosi, spesifik, scroll-stop. Kamu cuma lihat 5 teratas.',
  },
  {
    tag: 'A.02',
    title: 'A/B otomatis',
    body: 'Klik sekali, 3 start frame paralel — masing-masing pakai hook berbeda. Bandingkan visual lalu pilih winner.',
  },
  {
    tag: 'B.01',
    title: 'Streaming progress',
    body: 'Tiap step dikirim ke browser saat selesai (SSE). Tidak ada spinner buta. Tahu persis di mana pipeline mandek.',
  },
  {
    tag: 'B.02',
    title: 'Token tracker',
    body: 'Tiap call AI dicatat tokennya. Total per task tampil di dashboard. Tahu biaya pasti, bukan kira-kira.',
  },
  {
    tag: 'C.01',
    title: 'Resume per-step',
    body: 'Pipeline gagal di step 5? Klik resume. State sebelumnya tetap di sana. Bukan ulang dari nol.',
  },
  {
    tag: 'C.02',
    title: 'Reference clone',
    body: 'Upload video TikTok viral. Kami ekstrak 4 frame, AI mempelajari pacing, hook, gaya — lalu replikasi untuk produkmu.',
  },
]

export function Features() {
  return (
    <section id="fitur" className="editorial grain border-t" style={{ background: 'var(--paper)', borderColor: 'var(--ink)' }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 lg:py-28">
        <header className="grid grid-cols-12 gap-6 lg:gap-10 mb-14">
          <div className="col-span-12 lg:col-span-3" data-reveal>
            <p className="mono mb-3">Bagian II</p>
            <p className="serif italic text-2xl">Mesin</p>
          </div>
          <h2 className="col-span-12 lg:col-span-9 display text-[clamp(2.4rem,6vw,5rem)]" data-reveal data-reveal-delay="1">
            Bukan satu fitur,
            <br />
            <em className="it">satu studio.</em>
          </h2>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t" style={{ borderColor: 'var(--ink)' }}>
          {FEATURES.map((f, i) => (
            <article
              key={f.tag}
              className="p-7 lg:p-10 relative border-b md:[&:nth-child(2n)]:border-l lg:[&]:border-l lg:[&:nth-child(3n+1)]:border-l-0"
              style={{ borderColor: 'var(--rule)' }}
              data-reveal
              data-reveal-delay={String((i % 4) + 1)}
            >
              <div className="flex items-center gap-3 mb-7">
                <span className="mono" style={{ color: 'var(--vermilion)' }}>{f.tag}</span>
                <span className="rule flex-1" />
              </div>
              <h3 className="serif text-2xl lg:text-3xl mb-4 leading-tight" style={{ fontWeight: 400, letterSpacing: '-0.01em' }}>
                {f.title}
              </h3>
              <p className="text-[0.95rem] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
                {f.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
