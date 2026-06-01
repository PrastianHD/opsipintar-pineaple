'use client'

// Editorial pull quote with massive serif
export function Manifesto() {
  return (
    <section className="editorial border-t border-b" style={{ background: 'var(--ink)', color: 'var(--paper)', borderColor: 'var(--ink)' }}>
      <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-24 lg:py-32 text-center relative">
        {/* Quote mark */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 display text-[12rem] leading-none pointer-events-none" style={{ color: 'var(--vermilion)', opacity: 0.5 }} aria-hidden>
          “
        </div>

        <p
          className="display text-[clamp(2rem,5.2vw,4.6rem)] relative"
          style={{ color: 'var(--paper)' }}
          data-reveal
        >
          Kami bukan generator UGC.
          <br />
          Kami <em className="it" style={{ color: 'var(--gold)' }}>tukang jahit</em> yang
          <br />
          kebetulan pakai mesin.
        </p>

        <div className="flex items-center justify-center gap-6 mt-12" data-reveal data-reveal-delay="1">
          <span className="rule" style={{ width: 60, background: 'var(--gold)' }} />
          <span className="mono" style={{ color: 'var(--gold)', opacity: 1 }}>Pineapple Studio · Manifesto No. 001</span>
          <span className="rule" style={{ width: 60, background: 'var(--gold)' }} />
        </div>
      </div>
    </section>
  )
}
