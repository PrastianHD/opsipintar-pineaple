'use client'
// app/dashboard/new/page.tsx
// Pipeline 8 step UGC:
// 1. Scrape → 2. Product Analysis → 3. Creative Director → 4. Hook Generator
// → 5. Generate Image → 6. Scene Analyze → 7. Video Scene → 8. Script + Clips

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppContext } from '@/lib/context'
import { toast } from 'sonner'
import {
  ArrowLeft, ArrowRight, Link2, Loader2, Sparkles, RefreshCw,
  CheckCircle2, ShoppingBag, User, ImageIcon, Video, Film,
  ChevronDown, Copy, UserCircle2, Layers, Clapperboard, Wand2,
} from 'lucide-react'
import { MODEL_PRESETS, BACKGROUND_PRESETS } from '@/lib/models'
import type {
  Task, ScrapedProduct, ProductAnalysis, CreativeConcept,
  HookOptions, GeneratedImage, SceneAnalysis, VideoScenePlan, UGCScript,
} from '@/lib/types'

// ─── Step Bar ─────────────────────────────────────────────────────────────────
const STEPS = [
  { n: 1, label: 'Produk'   },
  { n: 2, label: 'Analisis' },
  { n: 3, label: 'Hook'     },
  { n: 4, label: 'Gambar'   },
  { n: 5, label: 'Video'    },
]

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-10">
      {STEPS.map((s, i) => (
        <div key={s.n} className="flex items-center flex-1 last:flex-none">
          <div className={`flex items-center gap-2 ${current >= s.n ? 'opacity-100' : 'opacity-35'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
              ${current > s.n ? 'bg-emerald-500 text-white' : current === s.n ? 'bg-violet-600 text-white ring-4 ring-violet-500/20' : 'bg-muted border border-border text-muted-foreground'}`}>
              {current > s.n ? <CheckCircle2 className="w-4 h-4" /> : s.n}
            </div>
            <span className={`text-xs font-bold hidden sm:block ${current === s.n ? 'text-foreground' : 'text-muted-foreground'}`}>{s.label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-px mx-2 transition-all ${current > s.n ? 'bg-emerald-500/50' : 'bg-border'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Helper copy ─────────────────────────────────────────────────────────────
function useCopy() {
  const copy = (text: string, label = 'Disalin!') => {
    navigator.clipboard.writeText(text)
    toast.success(label)
  }
  return copy
}

// ─── Loading Card ─────────────────────────────────────────────────────────────
function LoadingCard({ label }: { label: string }) {
  return (
    <div className="glass-card rounded-2xl p-12 flex flex-col items-center gap-5">
      <div className="relative w-20 h-20">
        <div className="w-20 h-20 rounded-full bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
          <Sparkles className="w-10 h-10 text-violet-500 animate-pulse" />
        </div>
        <div className="absolute inset-0 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
      </div>
      <p className="font-bold text-lg text-foreground">{label}</p>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function NewTaskPage() {
  const router = useRouter()
  const { addTask, updateTask, settings } = useAppContext()
  const copy = useCopy()

  const [uiStep, setUiStep] = useState(1)
  const [taskId] = useState(() => 'TASK-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7).toUpperCase())

  // ── Step 1 state ────────────────────────────────────────────────────────────
  const [productUrl, setProductUrl]         = useState('')
  const [targetMarket, setTargetMarket]     = useState('')
  const [needCharacter, setNeedCharacter]   = useState<boolean | null>(null)
  const [selectedModelId, setSelectedModelId]   = useState<string>('')
  const [selectedBgId, setSelectedBgId]     = useState<string>('')   // '' = AI pilih
  const [referenceVideoFile, setRefVideoFile] = useState<File | null>(null)
  const [scrapeLoading, setScrapeLoading]   = useState(false)
  const [scraped, setScraped]               = useState<ScrapedProduct | null>(null)
  const [isExtractingFrames, setExtractingFrames] = useState(false)

  // ── Step 2 state (analisis + creative + hooks) ──────────────────────────────
  const [analyzeLoading, setAnalyzeLoading] = useState(false)
  const [productAnalysis, setProductAnalysis] = useState<ProductAnalysis | null>(null)
  const [creative, setCreative]             = useState<CreativeConcept | null>(null)
  const [hooks, setHooks]                   = useState<HookOptions | null>(null)
  const [selectedHookIdx, setSelectedHookIdx] = useState(0)

  // ── Step 3 (generate image) state ──────────────────────────────────────────
  const [genLoading, setGenLoading]         = useState(false)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [selectedImgIdx, setSelectedImgIdx] = useState(0)
  const [customPrompt, setCustomPrompt]     = useState('')
  const [showPromptEditor, setShowPromptEditor] = useState(false)

  // ── Step 4 (scene → video scene → script) state ────────────────────────────
  const [scriptLoading, setScriptLoading]   = useState(false)

  // ─── Scrape ─────────────────────────────────────────────────────────────────
  const handleScrape = async () => {
    if (!productUrl.trim()) { toast.error('Masukkan link Shopee'); return }
    setScrapeLoading(true)
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: productUrl }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setScraped(data.data)
      toast.success('Produk ditemukan!')
    } catch (e: any) { toast.error(e.message || 'Gagal scrape') }
    finally { setScrapeLoading(false) }
  }

  const extractFrames = (file: File, numFrames = 4): Promise<string[]> => {
    return new Promise(resolve => {
      const video = document.createElement('video')
      video.src = URL.createObjectURL(file)
      video.crossOrigin = 'anonymous'
      video.muted = true
      video.onloadedmetadata = async () => {
        const interval = video.duration / (numFrames + 1)
        const frames: string[] = []
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        for (let i = 1; i <= numFrames; i++) {
          video.currentTime = interval * i
          await new Promise(r => { video.onseeked = r })
          const s = 480 / video.videoHeight
          canvas.width = video.videoWidth * s; canvas.height = 480
          ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)
          frames.push(canvas.toDataURL('image/jpeg', 0.6))
        }
        URL.revokeObjectURL(video.src)
        resolve(frames)
      }
    })
  }

  // ─── Jalankan Steps 1-3 otomatis: analyze → creative → hooks ───────────────
  const handleGoAnalyze = async () => {
    if (!scraped) { toast.error('Scrape produk dulu'); return }
    if (!settings.openaiApiKey) { toast.error('OpenAI API key belum diisi'); return }

    let referenceFrames: string[] = []
    if (referenceVideoFile) {
      setExtractingFrames(true)
      try { referenceFrames = await extractFrames(referenceVideoFile) } catch {}
      setExtractingFrames(false)
    }

    const task: Task = {
      id: taskId, status: 'analyzing', createdAt: Date.now(), updatedAt: Date.now(),
      input: { productLink: productUrl, targetMarket, needCharacter, modelId: selectedModelId, backgroundId: selectedBgId || undefined },
      scraped,
    }
    addTask(task)
    setUiStep(2)
    setAnalyzeLoading(true)

    try {
      // ── Step 1: Product Analysis ──────────────────────────────────────────
      const r1 = await fetch('/api/analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: scraped, targetMarket, referenceFrames, openaiApiKey: settings.openaiApiKey }),
      })
      const d1 = await r1.json()
      if (!d1.success) throw new Error(d1.error)
      setProductAnalysis(d1.data)
      updateTask(taskId, { status: 'creative', productAnalysis: d1.data })

      // ── Step 2: Creative Director ─────────────────────────────────────────
      const r2 = await fetch('/api/creative', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productAnalysis: d1.data, openaiApiKey: settings.openaiApiKey }),
      })
      const d2 = await r2.json()
      if (!d2.success) throw new Error(d2.error)
      setCreative(d2.data)
      updateTask(taskId, { status: 'hooks', creative: d2.data })

      // ── Step 3: Hook Generator ────────────────────────────────────────────
      const r3 = await fetch('/api/hooks', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productAnalysis: d1.data, creative: d2.data, openaiApiKey: settings.openaiApiKey }),
      })
      const d3 = await r3.json()
      if (!d3.success) throw new Error(d3.error)
      setHooks(d3.data)
      updateTask(taskId, { status: 'generating', hooks: d3.data })

      toast.success('Analisis & hook selesai!')
    } catch (e: any) {
      toast.error(e.message || 'Gagal analisis')
      updateTask(taskId, { status: 'error', error: e.message })
    } finally {
      setAnalyzeLoading(false)
    }
  }

  // ─── Generate Image (Step 4 & 5) ────────────────────────────────────────────
  const handleGenerateImage = async () => {
    if (!scraped || !productAnalysis) { toast.error('Analisis produk dulu'); return }
    if (!settings.leonardoApiKey) { toast.error('Leonardo API key belum diisi'); return }
    if (needCharacter && !selectedModelId) { toast.error('Pilih model dulu'); return }

    setGenLoading(true)
    try {
      const selectedHook = hooks?.hooks?.[selectedHookIdx] || ''
      const res = await fetch('/api/generate-image', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: scraped,
          productAnalysis,
          creative,
          selectedHook,
          needCharacter,
          modelId: selectedModelId || null,
          backgroundId: selectedBgId || null,
          customPrompt: customPrompt || undefined,
          leonardoApiKey: settings.leonardoApiKey,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)

      const newImg: GeneratedImage = data.data
      setGeneratedImages(prev => {
        const updated = [...prev, newImg]
        setSelectedImgIdx(updated.length - 1)
        updateTask(taskId, { generatedImages: updated })
        return updated
      })
      toast.success('Gambar berhasil digenerate!')
    } catch (e: any) {
      toast.error(e.message || 'Gagal generate gambar')
    } finally { setGenLoading(false) }
  }

  // ─── Generate Script + Clips (Step 6 → 7 → 8 otomatis) ─────────────────────
  const handleGenerateScript = async () => {
    if (!settings.openaiApiKey) { toast.error('OpenAI API key belum diisi'); return }
    const currentImg = generatedImages[selectedImgIdx]
    if (!currentImg) return

    setScriptLoading(true)
    try {
      const selectedHook = hooks?.hooks?.[selectedHookIdx] || ''

      // ── Step 6: Scene Analyzer ──────────────────────────────────────────────
      const r6 = await fetch('/api/scene-analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: currentImg.url,
          productName: scraped?.name,
          hasCharacter: needCharacter ?? false,   // ← diteruskan ke prompt
          openaiApiKey: settings.openaiApiKey,
        }),
      })
      const d6 = await r6.json()
      if (!d6.success) throw new Error(d6.error)
      const sceneAnalysis: SceneAnalysis = d6.data

      // ── Step 7: Video Scene Builder ─────────────────────────────────────────
      const r7 = await fetch('/api/video-scene', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: scraped?.name,
          sceneAnalysis,
          creative,
          selectedHook,
          hasCharacter: needCharacter ?? false,
          openaiApiKey: settings.openaiApiKey,
        }),
      })
      const d7 = await r7.json()
      if (!d7.success) throw new Error(d7.error)
      const videoScene: VideoScenePlan = d7.data

      // ── Step 8: UGC Script Writer ───────────────────────────────────────────
      const r8 = await fetch('/api/video-prompt', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: currentImg.url,
          productName: scraped?.name,
          productAnalysis,
          creative,
          sceneAnalysis,
          videoScene,
          selectedHook,
          hasCharacter: needCharacter ?? false,
          openaiApiKey: settings.openaiApiKey,
        }),
      })
      const d8 = await r8.json()
      if (!d8.success) throw new Error(d8.error)
      const script: UGCScript = d8.data

      // Update gambar yang dipilih dengan semua data script
      setGeneratedImages(prev => {
        const updated = prev.map((img, idx) =>
          idx === selectedImgIdx
            ? { ...img, sceneAnalysis, videoScene, script, clip1: script.clip1, clip2: script.clip2, fullScene: script.fullScene }
            : img
        )
        updateTask(taskId, { generatedImages: updated })
        return updated
      })
      toast.success('Script & video prompt siap!')
    } catch (e: any) {
      toast.error(e.message || 'Gagal generate script')
    } finally { setScriptLoading(false) }
  }

  const handleFinish = () => {
    updateTask(taskId, { status: 'finished' })
    toast.success('Tugas disimpan!')
    router.push(`/dashboard/tasks/${taskId}`)
  }

  // ─── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[85vh] bg-background text-foreground relative">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.05)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none opacity-40 dark:opacity-20" />

      <div className="relative max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => uiStep > 1 ? setUiStep(uiStep - 1) : router.push('/dashboard')}
            className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Tugas Baru</h1>
            <p className="text-sm text-muted-foreground font-medium">Pipeline UGC 8 step otomatis</p>
          </div>
        </div>

        <StepBar current={uiStep} />

        {/* ══════════════════════════════════════════════════════════════════════
            UI STEP 1 — Input Produk
        ═══════════════════════════════════════════════════════════════════════ */}
        {uiStep === 1 && (
          <div className="space-y-5">

            {/* Link Shopee */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag className="w-5 h-5 text-violet-500" />
                <h2 className="font-bold">Link Shopee</h2>
              </div>
              <div className="flex gap-2">
                <input
                  value={productUrl} onChange={e => setProductUrl(e.target.value)}
                  placeholder="https://shopee.co.id/..."
                  className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
                <button onClick={handleScrape} disabled={scrapeLoading}
                  className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-50 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors">
                  {scrapeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                  {scrapeLoading ? 'Scraping...' : 'Ambil'}
                </button>
              </div>

              {scraped && (
                <div className="mt-5 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div className="flex gap-4">
                    {scraped.imageUrls[0] && (
                      <img src={scraped.imageUrls[0]} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0 border border-border/50" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-emerald-700 text-xs font-bold uppercase tracking-wider">Produk ditemukan</span>
                      </div>
                      <p className="font-bold text-sm line-clamp-2">{scraped.name}</p>
                      {scraped.price && <p className="text-xs text-violet-500 mt-1">{scraped.price}</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Reference Video */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <Film className="w-5 h-5 text-violet-500" />
                <h2 className="font-bold">Reference Video <span className="text-violet-400">(AI Clone)</span></h2>
              </div>
              <p className="text-xs text-muted-foreground mb-4">Upload video TikTok/Reels viral. AI meniru hook, gaya, dan angle-nya.</p>
              <input type="file" accept="video/mp4,video/quicktime"
                onChange={e => setRefVideoFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-violet-500/10 file:text-violet-700 dark:file:text-violet-300 hover:file:bg-violet-500/20 cursor-pointer border border-border rounded-xl px-3 py-2 bg-background"
              />
              {referenceVideoFile && (
                <p className="text-xs text-emerald-600 font-semibold mt-3 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Video siap dianalisis
                </p>
              )}
            </div>

            {/* Preferensi */}
            <div className="glass-card rounded-2xl p-6 space-y-5">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-violet-500" />
                <h2 className="font-bold">Preferensi</h2>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground mb-2 block uppercase tracking-wide">Target Pasar</label>
                <textarea value={targetMarket} onChange={e => setTargetMarket(e.target.value)}
                  placeholder="Wanita 18-35 tahun, interested in skincare..." rows={2}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:border-violet-500 resize-none transition-all" />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground mb-2 block uppercase tracking-wide">Video Style</label>
                <div className="flex gap-2">
                  {[
                    { val: null,  label: 'Auto AI' },
                    { val: true,  label: 'Ada Model' },
                    { val: false, label: 'Produk Only' },
                  ].map(({ val, label }) => (
                    <button key={String(val)} onClick={() => setNeedCharacter(val)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${needCharacter === val ? 'bg-violet-600 border-violet-500 text-white' : 'bg-background border-border text-muted-foreground hover:bg-muted'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Pilih Model dari Supabase (klik, bukan upload) ─────────────── */}
              {needCharacter !== false && (
                <div className="space-y-4 p-5 bg-violet-500/5 border border-violet-500/20 rounded-xl animate-in fade-in">
                  <div>
                    <label className="text-xs font-bold text-violet-700 dark:text-violet-300 mb-3 block uppercase tracking-wide flex items-center gap-1.5">
                      <UserCircle2 className="w-4 h-4" /> Pilih Model
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {MODEL_PRESETS.map(model => (
                        <button key={model.id} onClick={() => setSelectedModelId(model.id)}
                          className={`relative rounded-xl overflow-hidden border-2 transition-all ${selectedModelId === model.id ? 'border-violet-500 ring-2 ring-violet-500/30' : 'border-transparent hover:border-violet-500/40'}`}>
                          <img src={model.thumbnail} alt={model.label} className="w-full h-24 object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{model.label}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${model.gender === 'female' ? 'bg-pink-500/80' : 'bg-blue-500/80'} text-white`}>
                              {model.gender === 'female' ? '♀' : '♂'}
                            </span>
                          </div>
                          {selectedModelId === model.id && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-violet-600 rounded-full flex items-center justify-center">
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    {needCharacter === true && !selectedModelId && (
                      <p className="text-xs text-amber-500 mt-2 font-medium">⚠ Pilih model untuk melanjutkan</p>
                    )}
                  </div>
                </div>
              )}

              {/* ── Background (opsional dari Supabase) ──────────────────────── */}
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-3 block uppercase tracking-wide flex items-center gap-1.5">
                  <Layers className="w-4 h-4" /> Background <span className="text-muted-foreground/50">(Opsional)</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {/* Opsi AI pilih */}
                  <button onClick={() => setSelectedBgId('')}
                    className={`rounded-xl border-2 h-16 flex items-center justify-center text-xs font-bold transition-all ${!selectedBgId ? 'border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400' : 'border-border text-muted-foreground hover:bg-muted'}`}>
                    ✨ AI Pilih
                  </button>
                  {BACKGROUND_PRESETS.map(bg => (
                    <button key={bg.id} onClick={() => setSelectedBgId(bg.id)}
                      className={`relative rounded-xl overflow-hidden border-2 h-16 transition-all ${selectedBgId === bg.id ? 'border-violet-500 ring-2 ring-violet-500/30' : 'border-transparent hover:border-violet-500/40'}`}>
                      <img src={bg.url} alt={bg.label} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-end justify-start p-1">
                        <span className="text-[10px] font-bold text-white leading-tight">{bg.label}</span>
                      </div>
                      {selectedBgId === bg.id && (
                        <div className="absolute top-1 right-1 w-4 h-4 bg-violet-600 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={handleGoAnalyze} disabled={!scraped || isExtractingFrames}
              className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-40 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md">
              {isExtractingFrames ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {isExtractingFrames ? 'Mengekstrak Video...' : 'Analisis dengan AI (3 Step Otomatis)'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            UI STEP 2 — Hasil Analisis + Pilih Hook
        ═══════════════════════════════════════════════════════════════════════ */}
        {uiStep === 2 && (
          <div className="space-y-5">
            {analyzeLoading ? (
              <LoadingCard label="Menjalankan 3 step analisis AI..." />
            ) : productAnalysis && creative && hooks ? (
              <>
                {/* Product Analysis */}
                <div className="glass-card rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <h2 className="font-bold">Step 1 — Product Analysis</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <InfoCard label="Kategori" value={productAnalysis.category} />
                    <InfoCard label="Target" value={productAnalysis.target_market} />
                    <InfoCard label="Confidence" value={productAnalysis.confidence} className="capitalize" />
                    <InfoCard label="Platform" value={creative.platform} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Strengths</p>
                    <div className="flex flex-wrap gap-2">
                      {productAnalysis.strengths.map((s, i) => (
                        <span key={i} className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-medium text-emerald-700 dark:text-emerald-300">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">UGC Angles</p>
                    <div className="flex flex-wrap gap-2">
                      {productAnalysis.ugc_angles.map((a, i) => (
                        <span key={i} className="px-2.5 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full text-xs font-medium text-violet-700 dark:text-violet-300">{a}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Creative Director */}
                <div className="glass-card rounded-2xl p-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-violet-500" />
                    <h2 className="font-bold">Step 2 — Creative Concept</h2>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed italic">"{creative.creative_concept}"</p>
                  <div className="grid grid-cols-2 gap-3">
                    <InfoCard label="Style" value={creative.content_style} />
                    <InfoCard label="Emotion" value={creative.emotion_trigger} />
                    <InfoCard label="Goal" value={creative.content_goal} className="col-span-2" />
                  </div>
                </div>

                {/* Hook Selector */}
                <div className="glass-card rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Clapperboard className="w-5 h-5 text-violet-500" />
                    <h2 className="font-bold">Step 3 — Pilih Hook</h2>
                  </div>
                  <p className="text-xs text-muted-foreground">Klik salah satu. Hook ini akan jadi pembuka video dan dipakai di image prompt.</p>
                  <div className="space-y-2">
                    {hooks.hooks.map((hook, i) => (
                      <button key={i} onClick={() => setSelectedHookIdx(i)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedHookIdx === i ? 'border-violet-500 bg-violet-500/10' : 'border-border bg-background hover:border-violet-500/40'}`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold mt-0.5 ${selectedHookIdx === i ? 'bg-violet-600 text-white' : 'bg-muted text-muted-foreground'}`}>
                            {i + 1}
                          </div>
                          <p className={`text-sm font-medium ${selectedHookIdx === i ? 'text-violet-700 dark:text-violet-300' : 'text-foreground'}`}>
                            {hook}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                  {hooks.hooks[selectedHookIdx] && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                        Hook dipilih: "{hooks.hooks[selectedHookIdx]}"
                      </p>
                    </div>
                  )}
                </div>

                <button onClick={() => setUiStep(3)}
                  className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md">
                  <ImageIcon className="w-5 h-5" /> Generate Start Frame
                  <ArrowRight className="w-5 h-5" />
                </button>
              </>
            ) : null}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            UI STEP 3 — Generate Image + Tampilkan Prompt
        ═══════════════════════════════════════════════════════════════════════ */}
        {uiStep === 3 && (
          <div className="space-y-5">
            {/* Gambar yang sudah digenerate */}
            {generatedImages.length > 0 && (
              <div className="glass-card rounded-2xl p-6 space-y-4">
                <h2 className="font-bold flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-violet-500" />
                  Start Frame ({generatedImages.length}x generate)
                </h2>

                <div className="relative rounded-xl overflow-hidden bg-muted border border-border">
                  <img src={generatedImages[selectedImgIdx]?.url} alt="Generated" className="w-full object-contain max-h-[500px]" />
                </div>

                {generatedImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {generatedImages.map((img, i) => (
                      <button key={img.id} onClick={() => setSelectedImgIdx(i)}
                        className={`shrink-0 rounded-lg overflow-hidden border-2 transition-all ${i === selectedImgIdx ? 'border-violet-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                        <img src={img.url} alt="" className="w-16 h-16 object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* ── Image Prompt Display (tampil di dashboard) ──────────────────── */}
                <div className="p-4 bg-muted/40 border border-border rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Image Prompt (Leonardo)</p>
                    <button onClick={() => copy(generatedImages[selectedImgIdx]?.prompt, 'Image prompt disalin!')}
                      className="p-1 hover:text-violet-500 transition-colors">
                      <Copy className="w-4 h-4 text-muted-foreground hover:text-violet-500" />
                    </button>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed font-mono whitespace-pre-wrap line-clamp-6">
                    {generatedImages[selectedImgIdx]?.prompt}
                  </p>
                </div>

                {/* ── Script & Clips Section ────────────────────────────────────────── */}
                <div className="border-t border-border pt-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-violet-700 dark:text-violet-300 flex items-center gap-2 uppercase tracking-wide">
                      <Video className="w-4 h-4" /> Script & Gemini Video Prompts
                    </h3>
                    {generatedImages[selectedImgIdx]?.clip1 && (
                      <button onClick={handleGenerateScript} disabled={scriptLoading}
                        className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors">
                        <RefreshCw className={`w-3.5 h-3.5 ${scriptLoading ? 'animate-spin' : ''}`} /> Regenerate
                      </button>
                    )}
                  </div>

                  {!generatedImages[selectedImgIdx]?.clip1 ? (
                    <button onClick={handleGenerateScript} disabled={scriptLoading}
                      className="w-full py-4 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 text-violet-700 dark:text-violet-300 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">
                      {scriptLoading
                        ? <><Loader2 className="w-5 h-5 animate-spin" /> Menjalankan 3 step otomatis...</>
                        : <><Sparkles className="w-5 h-5" /> Generate Script + Gemini Clips (3 Step)</>}
                    </button>
                  ) : (
                    <ScriptDisplay
                      img={generatedImages[selectedImgIdx]}
                      onCopy={copy}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Panel Generate Gambar */}
            <div className="glass-card rounded-2xl p-6 space-y-5">
              <h2 className="font-bold">{generatedImages.length === 0 ? 'Generate Start Frame' : 'Generate Ulang'}</h2>

              {/* Hook yang dipilih */}
              {hooks && (
                <div className="p-3 bg-violet-500/5 border border-violet-500/20 rounded-xl">
                  <p className="text-xs font-bold text-violet-700 dark:text-violet-300 mb-1">Hook terpilih:</p>
                  <p className="text-sm italic text-foreground">"{hooks.hooks[selectedHookIdx]}"</p>
                </div>
              )}

              {/* Model info */}
              {needCharacter !== false && selectedModelId && (
                <div className="flex items-center gap-3 p-3 bg-muted/40 border border-border rounded-xl">
                  {MODEL_PRESETS.find(m => m.id === selectedModelId) && (
                    <img
                      src={MODEL_PRESETS.find(m => m.id === selectedModelId)!.thumbnail}
                      alt="" className="w-10 h-10 rounded-lg object-cover border border-border"
                    />
                  )}
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Model</p>
                    <p className="text-sm font-semibold">{MODEL_PRESETS.find(m => m.id === selectedModelId)?.label}</p>
                  </div>
                </div>
              )}

              {/* Background info */}
              {selectedBgId && (
                <div className="flex items-center gap-3 p-3 bg-muted/40 border border-border rounded-xl">
                  <img
                    src={BACKGROUND_PRESETS.find(b => b.id === selectedBgId)?.url}
                    alt="" className="w-10 h-10 rounded-lg object-cover border border-border"
                  />
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Background</p>
                    <p className="text-sm font-semibold">{BACKGROUND_PRESETS.find(b => b.id === selectedBgId)?.label}</p>
                  </div>
                </div>
              )}

              {/* Custom prompt (collapsed) */}
              <div>
                <button onClick={() => setShowPromptEditor(!showPromptEditor)}
                  className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors uppercase tracking-wide">
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showPromptEditor ? 'rotate-180' : ''}`} />
                  {showPromptEditor ? 'Sembunyikan' : 'Edit prompt manual'}
                </button>
                {showPromptEditor && (
                  <textarea value={customPrompt} onChange={e => setCustomPrompt(e.target.value)}
                    placeholder="Kosongkan untuk auto-generate. Atau tulis prompt custom..."
                    rows={4}
                    className="mt-2 w-full bg-background border border-border rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-violet-500 resize-none transition-all"
                  />
                )}
              </div>

              <button onClick={handleGenerateImage} disabled={genLoading || (needCharacter === true && !selectedModelId)}
                className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-50 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md">
                {genLoading
                  ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</>
                  : <><Sparkles className="w-5 h-5" /> {generatedImages.length === 0 ? 'Generate Gambar' : 'Coba Gambar Lain'}</>}
              </button>
            </div>

            {generatedImages.length > 0 && (
              <button onClick={handleFinish}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md">
                <CheckCircle2 className="w-5 h-5" /> Selesai & Simpan Tugas
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Script Display Component ─────────────────────────────────────────────────
function ScriptDisplay({ img, onCopy }: { img: GeneratedImage; onCopy: (t: string, l?: string) => void }) {
  const script = img.script

  // ── Build full video JSON (kedua clips + global_constraints) untuk copy ──────
  const buildFullVideoJson = (): string => {
    const gc = (script as any)?.globalConstraints ?? null
    return JSON.stringify({
      total_duration_seconds: 20,
      clips: [
        img.clip1 ? {
          clip_number: 1,
          duration_seconds: 10,
          type: img.clip1.notes || 'clip 1',
          prompt: img.clip1.prompt,
          ...(img.clip1.endFrame ? { endFrame: img.clip1.endFrame } : {}),
        } : null,
        img.clip2 ? {
          clip_number: 2,
          duration_seconds: 10,
          type: img.clip2.notes || 'clip 2',
          prompt: img.clip2.prompt,
          ...(img.clip2.endFrame ? { endFrame: img.clip2.endFrame } : {}),
        } : null,
      ].filter(Boolean),
      ...(gc ? { global_constraints: gc } : {}),
    }, null, 2)
  }

  // ── Build per-clip JSON (untuk tombol salin per clip) ─────────────────────
  const buildClipJson = (clip: typeof img.clip1, clipNum: number): string => {
    if (!clip) return ''
    return JSON.stringify({
      clip_number: clipNum,
      prompt: clip.prompt,
      ...(clip.endFrame ? { endFrame: clip.endFrame } : {}),
      ...(clip.endFrame ? { endFrame: clip.endFrame } : {}),
    }, null, 2)
  }

  return (
    <div className="space-y-3">
      {/* Script structure — ada model only */}
      {script && (script.hook || script.problem) && (
        <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-3">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">📋 Script Structure</p>
          {[
            { label: 'Hook',     val: script.hook },
            { label: 'Problem',  val: script.problem },
            { label: 'Solution', val: script.solution },
            { label: 'Demo',     val: script.product_demo },
            { label: 'CTA',      val: script.cta },
          ].filter(r => r.val).map(row => (
            <div key={row.label} className="flex gap-3">
              <span className="text-xs font-bold text-muted-foreground w-16 shrink-0 mt-0.5 uppercase">{row.label}</span>
              <p className="text-sm text-foreground">{row.val}</p>
            </div>
          ))}
        </div>
      )}

      {/* Full scene summary */}
      {img.fullScene && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-800 dark:text-blue-200">
          <span className="font-bold">Summary:</span> {img.fullScene}
        </div>
      )}

      {/* ── Tombol Salin Semua (full video JSON) ── */}
      {(img.clip1 || img.clip2) && (
        <button
          onClick={() => onCopy(buildFullVideoJson(), '✅ Full video JSON disalin!')}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 transition-colors"
        >
          <Copy className="w-4 h-4 text-white" />
          <span className="text-sm font-semibold text-white">Salin Semua (Full Video JSON)</span>
        </button>
      )}

      {/* Clip 1 */}
      {img.clip1 && (
        <ClipCard
          label="🎬 Clip 1 (0 – 10 detik)"
          clip={img.clip1}
          fullJson={buildClipJson(img.clip1, 1)}
          onCopy={onCopy}
          copyLabel="Clip 1 disalin!"
        />
      )}

      {/* Clip 2 */}
      {img.clip2 && (
        <ClipCard
          label="🎬 Clip 2 (10 – 20 detik)"
          clip={img.clip2}
          fullJson={buildClipJson(img.clip2, 2)}
          onCopy={onCopy}
          copyLabel="Clip 2 disalin!"
        />
      )}
    </div>
  )
}

// ─── ClipCard — preview 160 char, copy = full JSON clip ─────────────────────
function ClipCard({
  label, clip, fullJson, onCopy, copyLabel,
}: {
  label: string
  clip: { prompt: string; endFrame?: string; notes?: string; duration?: string; veo_parameters?: any }
  fullJson: string
  onCopy: (t: string, l?: string) => void
  copyLabel: string
}) {
  const PREVIEW_LEN = 160
  const isLong = clip.prompt.length > PREVIEW_LEN
  const [expanded, setExpanded] = React.useState(false)

  return (
    <div className="p-4 bg-violet-500/5 border border-violet-500/20 rounded-xl space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-violet-700 dark:text-violet-300">{label}</p>
        <button
          onClick={() => onCopy(fullJson, copyLabel)}
          title="Salin full JSON clip ini"
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 transition-colors"
        >
          <Copy className="w-3.5 h-3.5 text-violet-500" />
          <span className="text-xs text-violet-600 dark:text-violet-300 font-medium">Salin JSON</span>
        </button>
      </div>

      {/* Prompt — terpotong di preview, expand untuk lihat semua */}
      <div className="text-sm text-foreground leading-relaxed font-mono whitespace-pre-wrap break-words bg-muted/30 rounded-lg p-3">
        {expanded || !isLong ? clip.prompt : clip.prompt.slice(0, PREVIEW_LEN) + '…'}
      </div>
      {isLong && (
        <button
          onClick={() => setExpanded(v => !v)}
          className="text-xs text-violet-500 hover:underline"
        >
          {expanded ? '▲ Sembunyikan' : `▼ Lihat semua (${clip.prompt.length} karakter)`}
        </button>
      )}

      {/* End Frame */}
      {clip.endFrame && (
        <div className="text-xs text-muted-foreground italic pt-2 border-t border-violet-500/10">
          <span className="font-bold not-italic text-foreground">End Frame: </span>{clip.endFrame}
        </div>
      )}

      {/* Veo parameters badge */}
      {clip.veo_parameters && (
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-violet-500/10">
          {Object.entries(clip.veo_parameters).map(([k, v]) => (
            <span key={k} className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-700 dark:text-violet-300 font-mono">
              {k}={v as string}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Helper Components ────────────────────────────────────────────────────────
function InfoCard({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div className={`bg-background border border-border rounded-xl p-3 ${className}`}>
      <p className="text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-bold text-foreground">{value}</p>
    </div>
  )
}