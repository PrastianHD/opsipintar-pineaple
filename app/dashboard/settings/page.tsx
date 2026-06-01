'use client'

import { useState, useEffect } from 'react'
import { useAppContext } from '@/lib/context'
import { PageShell, PageHeader } from '@/components/dashboard/page-shell'
import {
  Eye, EyeOff, CheckCircle2, AlertCircle, Key, Zap, Lock,
  Link2, Bot, Wand2, Film, ExternalLink, Gauge, Sparkles, Crown,
  ImageIcon, Layers,
} from 'lucide-react'
import { toast } from 'sonner'
import type { QualityTier } from '@/lib/openrouter'

type ImageProvider = 'leonardo' | 'openrouter'

const OPENROUTER_IMAGE_MODELS = [
  { id: 'google/gemini-2.5-flash-image',           label: 'Gemini 2.5 Flash Image',  cost: '~Rp 55/img',  desc: 'Default. Murah, cepat, kualitas UGC bagus.' },
  { id: 'google/gemini-3.1-flash-image-preview',   label: 'Gemini 3.1 Flash Image',  cost: '~Rp 70/img',  desc: 'Quality boost dari 2.5. Pro-level visual.' },
  { id: 'google/gemini-3-pro-image-preview',       label: 'Gemini 3 Pro Image',      cost: '~Rp 280/img', desc: 'Premium. Detail tinggi, prompt adherence top.' },
] as const

function ApiKeyInput({
  label, description, value, onChange, placeholder, docsUrl, testUrl,
}: {
  label: string
  description: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  docsUrl?: string
  testUrl?: string
}) {
  const [show, setShow] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'ok' | 'fail' | null>(null)

  const handleTest = async () => {
    if (!value) { toast.error('Masukkan API key dulu'); return }
    if (!testUrl) return
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch(testUrl, {
        method: 'GET',
        headers: { Authorization: `Bearer ${value}` },
      })
      const ok = res.ok
      setTestResult(ok ? 'ok' : 'fail')
      if (ok) toast.success(`${label} valid!`)
      else toast.error(`${label}: ${res.status} ${res.statusText}`)
    } catch {
      setTestResult('fail')
      toast.error('Koneksi gagal')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <label className="text-sm font-semibold text-foreground">{label}</label>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
        </div>
        {testResult && (
          <span className={`shrink-0 inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-bold border ${
            testResult === 'ok'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
          }`}>
            {testResult === 'ok' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
            {testResult === 'ok' ? 'Valid' : 'Error'}
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type={show ? 'text' : 'password'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-card border border-border rounded-xl pl-4 pr-11 py-2.5 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all font-mono text-foreground"
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            aria-label={show ? 'Sembunyikan' : 'Tampilkan'}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {testUrl && (
          <button
            type="button"
            onClick={handleTest}
            disabled={testing || !value}
            className="px-4 py-2.5 bg-card border border-border rounded-xl text-xs font-bold hover:border-violet-500/40 hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all whitespace-nowrap text-foreground"
          >
            {testing ? 'Cek...' : 'Test'}
          </button>
        )}
      </div>

      {docsUrl && (
        <a
          href={docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
        >
          Cara mendapatkan API key <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  )
}

const PIPELINE_NODES = [
  { label: 'Scrape',    sub: 'Built-in',    Icon: Link2, requires: null as null | 'or' | 'leo' },
  { label: 'Analisis',  sub: 'OpenRouter',  Icon: Bot,   requires: 'or' as const },
  { label: 'Gambar',    sub: 'Leonardo',    Icon: Wand2, requires: 'leo' as const },
  { label: 'Video',     sub: 'OpenRouter',  Icon: Film,  requires: 'or' as const },
] as const

export default function SettingsPage() {
  const { settings, setSettings } = useAppContext()
  const [openrouterKey, setOpenrouterKey] = useState(settings.openrouterApiKey)
  const [leonardoKey, setLeonardoKey] = useState(settings.leonardoApiKey)
  const [tier, setTier] = useState<QualityTier>(settings.qualityTier)
  const [imgProvider, setImgProvider] = useState<ImageProvider>(settings.imageProvider)
  const [imgModel, setImgModel] = useState<string>(settings.imageModel)

  useEffect(() => {
    setOpenrouterKey(settings.openrouterApiKey)
    setLeonardoKey(settings.leonardoApiKey)
    setTier(settings.qualityTier)
    setImgProvider(settings.imageProvider)
    setImgModel(settings.imageModel)
  }, [settings])

  const handleSave = () => {
    setSettings({
      openrouterApiKey: openrouterKey.trim(),
      leonardoApiKey: leonardoKey.trim(),
      qualityTier: tier,
      imageProvider: imgProvider,
      imageModel: imgModel,
    })
    toast.success('Pengaturan disimpan')
  }

  const bothFilled = !!openrouterKey && !!leonardoKey

  return (
    <PageShell maxWidth="md">
      <PageHeader
        title="Pengaturan"
        description="Konfigurasi API key untuk pipeline UGC. Disimpan lokal di browser."
      />

      <div className="space-y-5">
        <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
          bothFilled
            ? 'bg-emerald-500/5 border-emerald-500/20'
            : 'bg-amber-500/5 border-amber-500/20'
        }`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            bothFilled ? 'bg-emerald-500/15 border border-emerald-500/30' : 'bg-amber-500/15 border border-amber-500/30'
          }`}>
            {bothFilled
              ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              : <AlertCircle className="w-5 h-5 text-amber-500" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${bothFilled ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}`}>
              {bothFilled ? 'Pipeline siap' : 'Konfigurasi belum lengkap'}
            </p>
            <p className={`text-xs mt-0.5 ${bothFilled ? 'text-emerald-700/70 dark:text-emerald-400/70' : 'text-amber-700/70 dark:text-amber-400/70'}`}>
              {bothFilled ? 'Semua API key terisi. Buat tugas baru untuk memulai.' : 'Lengkapi kedua API key di bawah.'}
            </p>
          </div>
        </div>

        <section className="glass-card rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Quality Tier</h3>
              <p className="text-xs text-muted-foreground">Pilih trade-off cost vs kualitas output AI.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {([
              { id: 'budget',   Icon: Zap,      label: 'Budget',   cost: '~$0.005/run', desc: 'Gemini 2.5 Flash Lite. Hemat, ID gaul medium.' },
              { id: 'balanced', Icon: Sparkles, label: 'Balanced', cost: '~$0.025/run', desc: 'Mix Gemini Flash + Claude Haiku. Recommended.' },
              { id: 'premium',  Icon: Crown,    label: 'Premium',  cost: '~$0.15/run',  desc: 'Claude Sonnet/Opus. Output paling natural.' },
            ] as const).map(({ id, Icon, label, cost, desc }) => {
              const active = tier === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTier(id)}
                  aria-pressed={active}
                  className={`text-left rounded-xl p-3.5 border-2 transition-all ${
                    active
                      ? 'border-violet-500 bg-violet-500/10 ring-2 ring-violet-500/20'
                      : 'border-border bg-card/50 hover:border-violet-500/40 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon className={`w-4 h-4 ${active ? 'text-violet-500' : 'text-muted-foreground'}`} />
                    <span className={`text-sm font-bold ${active ? 'text-violet-700 dark:text-violet-300' : 'text-foreground'}`}>
                      {label}
                    </span>
                    {id === 'balanced' && !active && (
                      <span className="ml-auto text-[9px] font-bold uppercase tracking-wider text-violet-500">Rec</span>
                    )}
                  </div>
                  <p className="text-[10px] font-mono font-semibold text-muted-foreground mb-1.5 tabular-nums">{cost}</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{desc}</p>
                </button>
              )
            })}
          </div>
        </section>

        <section className="glass-card rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Image Provider</h3>
              <p className="text-xs text-muted-foreground">Pilih engine generate start frame.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
            {([
              { id: 'leonardo',   Icon: Layers,    label: 'Leonardo',   cost: '~Rp 200/img',  desc: 'Multi-ref strength control (model + bg + product). Polling 15-30s.' },
              { id: 'openrouter', Icon: Sparkles,  label: 'OpenRouter', cost: 'mulai Rp 55',  desc: 'Gemini Image. Single-ref inline. Sync 4-8s.' },
            ] as const).map(({ id, Icon, label, cost, desc }) => {
              const active = imgProvider === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setImgProvider(id)}
                  aria-pressed={active}
                  className={`text-left rounded-xl p-3.5 border-2 transition-all ${
                    active
                      ? 'border-violet-500 bg-violet-500/10 ring-2 ring-violet-500/20'
                      : 'border-border bg-card/50 hover:border-violet-500/40 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon className={`w-4 h-4 ${active ? 'text-violet-500' : 'text-muted-foreground'}`} />
                    <span className={`text-sm font-bold ${active ? 'text-violet-700 dark:text-violet-300' : 'text-foreground'}`}>
                      {label}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono font-semibold text-muted-foreground mb-1.5 tabular-nums">{cost}</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{desc}</p>
                </button>
              )
            })}
          </div>

          {imgProvider === 'openrouter' && (
            <div className="pt-4 border-t border-border space-y-2">
              <label className="text-xs font-semibold text-foreground">Model OpenRouter</label>
              <div className="grid grid-cols-1 gap-2">
                {OPENROUTER_IMAGE_MODELS.map(({ id, label, cost, desc }) => {
                  const active = imgModel === id
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setImgModel(id)}
                      aria-pressed={active}
                      className={`text-left rounded-xl p-3 border transition-all ${
                        active
                          ? 'border-violet-500 bg-violet-500/10'
                          : 'border-border bg-card/50 hover:border-violet-500/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className={`text-sm font-bold ${active ? 'text-violet-700 dark:text-violet-300' : 'text-foreground'}`}>
                          {label}
                        </span>
                        <span className="text-[10px] font-mono font-semibold text-muted-foreground tabular-nums">{cost}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">{desc}</p>
                      <p className="text-[10px] font-mono text-muted-foreground/60 mt-1">{id}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </section>

        <section className="glass-card rounded-2xl p-5 sm:p-6">
          <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-5">Alur Pipeline</h3>
          <ol className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 relative">
            {PIPELINE_NODES.map((node, i) => {
              const ok = node.requires === null
                || (node.requires === 'or' && !!openrouterKey)
                || (node.requires === 'leo' && !!leonardoKey)
              return (
                <li
                  key={i}
                  className={`relative rounded-xl p-3 sm:p-4 border transition-colors ${
                    ok
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-border bg-card/50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                    ok
                      ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                      : 'bg-muted text-muted-foreground border border-border'
                  }`}>
                    <node.Icon className="w-4 h-4" />
                  </div>
                  <p className={`text-xs font-bold ${ok ? 'text-emerald-700 dark:text-emerald-300' : 'text-foreground'}`}>
                    {i + 1}. {node.label}
                  </p>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mt-0.5">
                    {node.sub}
                  </p>
                </li>
              )
            })}
          </ol>
        </section>

        <section className="glass-card rounded-2xl p-5 sm:p-6 space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500">
              <Key className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-foreground">API Keys</h2>
          </div>

          <div className="h-px bg-border" />

          <ApiKeyInput
            label="OpenRouter API Key"
            description="Untuk analisis produk, creative, hooks, scene & video prompt."
            value={openrouterKey}
            onChange={setOpenrouterKey}
            placeholder="sk-or-..."
            docsUrl="https://openrouter.ai/keys"
            testUrl="https://openrouter.ai/api/v1/models"
          />

          <div className="h-px bg-border" />

          <ApiKeyInput
            label="Leonardo.ai API Key"
            description="Untuk generate start frame gambar UGC."
            value={leonardoKey}
            onChange={setLeonardoKey}
            placeholder="Bearer token..."
            docsUrl="https://docs.leonardo.ai/docs/create-your-api-key"
          />

          <button
            type="button"
            onClick={handleSave}
            className="w-full py-3 mt-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-violet-500/25 focus-visible:ring-2 focus-visible:ring-violet-500/50"
          >
            <Zap className="w-4 h-4" />
            Simpan Pengaturan
          </button>
        </section>

        <div className="bg-card/50 border border-border rounded-2xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div className="text-xs text-muted-foreground leading-relaxed">
            <p className="font-semibold text-foreground mb-0.5">Keamanan Lokal</p>
            <p>API key disimpan hanya di browser Anda (localStorage). Tidak dikirim atau dicatat di server kami. Hanya digunakan saat pipeline berjalan.</p>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
