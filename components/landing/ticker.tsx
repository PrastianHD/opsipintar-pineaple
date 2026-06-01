'use client'

const ITEMS = [
  'Vol. 01',
  '★',
  'Studio UGC otomatis',
  '★',
  'Terbit Mei 2026',
  '★',
  'Dijahit di Jakarta',
  '★',
  'Prompt video Veo3 · Gemini I2V',
  '★',
  'Untuk brand yang gak mau template',
  '★',
  '90 detik dari link ke prompt',
  '★',
]

export function Ticker() {
  return (
    <div className="editorial border-y" style={{ borderColor: 'var(--ink)', background: 'var(--ink)', color: 'var(--paper)' }}>
      <div className="overflow-hidden py-3.5">
        <div className="ticker-track">
          {[...ITEMS, ...ITEMS].map((it, i) => (
            <span key={i} className="mono" style={{ color: 'var(--paper)', opacity: it === '★' ? 0.45 : 0.85, letterSpacing: '0.18em' }}>
              {it}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
