'use client'

import Link from 'next/link'
import { use, useMemo, useState } from 'react'
import { useAppContext } from '@/lib/context'
import { getStatusPresentation } from '@/lib/status'
import { Section } from '@/components/dashboard/section'
import { MiniRow, SceneRow } from '@/components/dashboard/primitives'
import { PageShell } from '@/components/dashboard/page-shell'
import {
  ArrowLeft, Copy, ExternalLink, ImageIcon, Video, Sparkles, RotateCw, Tag,
} from 'lucide-react'
import { toast } from 'sonner'
import type { GeneratedImage, TaskStatus } from '@/lib/types'

function nextStep(status: TaskStatus, hasImages: boolean): string | null {
  if (status === 'finished') return null
  if (status === 'error') return 'Mulai ulang'
  if (status === 'pending' || status === 'analyzing' || status === 'creative' || status === 'hooks') {
    return 'Lanjut ke generate gambar'
  }
  if (status === 'generating' && !hasImages) return 'Generate gambar'
  if (status === 'generating' && hasImages) return 'Generate script'
  return 'Lanjutkan'
}

const copy = (text: string, label = 'Disalin!') => {
  if (!text) return
  navigator.clipboard.writeText(text)
  toast.success(label)
}

export default function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string }
}) {
  const resolvedParams = typeof (params as any)?.then === 'function'
    ? use(params as Promise<{ id: string }>)
    : (params as { id: string })

  const { tasks } = useAppContext()
  const task = tasks.find((t) => t.id === resolvedParams.id)
  const [selectedImg, setSelectedImg] = useState(0)

  if (!task) {
    return (
      <PageShell maxWidth="md">
        <div className="glass-card rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-7 h-7 text-rose-500" />
          </div>
          <p className="text-base font-semibold text-foreground mb-2">Tugas tidak ditemukan</p>
          <p className="text-sm text-muted-foreground mb-5">Kemungkinan sudah dihapus atau ID tidak valid.</p>
          <Link
            href="/dashboard/tasks"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border hover:border-violet-500/40 hover:bg-muted text-foreground text-sm font-semibold transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke daftar
          </Link>
        </div>
      </PageShell>
    )
  }

  const statusCfg = getStatusPresentation(task.status)
  const imgs = task.generatedImages || []
  const safeIdx = Math.min(selectedImg, Math.max(imgs.length - 1, 0))
  const currentImg = imgs[safeIdx]
  const resumeLabel = nextStep(task.status, imgs.length > 0)

  const totalTokens = useMemo(() => {
    if (task.usage?.total) return task.usage.total
    return Object.values(task.usage || {})
      .filter((v): v is { total_tokens?: number } => typeof v === 'object' && v !== null)
      .reduce((acc, v) => acc + (v?.total_tokens || 0), 0)
  }, [task.usage])

  return (
    <PageShell maxWidth="xl">
      <div className="flex items-start gap-3 mb-6">
        <Link
          href="/dashboard/tasks"
          aria-label="Kembali ke daftar tugas"
          className="mt-1 w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-muted hover:border-violet-500/40 transition-all shrink-0 focus-visible:ring-2 focus-visible:ring-violet-500/50"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-1.5">
            <Link href="/dashboard/tasks" className="hover:text-foreground transition-colors">Tugas</Link>
            <span aria-hidden>/</span>
            <span className="font-mono text-[11px] text-muted-foreground/70 truncate">{task.id.slice(0, 16)}…</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
            {task.scraped?.name || 'Tugas tanpa nama'}
          </h1>
          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusCfg.chip}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
              {statusCfg.label}
            </span>
            <span className="text-xs font-medium text-muted-foreground tabular-nums">
              {new Date(task.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            {totalTokens > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-card border border-border text-[10px] font-bold text-muted-foreground tabular-nums">
                <Sparkles className="w-3 h-3 text-violet-500" />
                {totalTokens.toLocaleString('id-ID')} tok
              </span>
            )}
            {resumeLabel && (
              <Link
                href="/dashboard/new"
                className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/30 text-xs font-bold text-violet-700 dark:text-violet-300 hover:bg-violet-500/20 transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5" /> {resumeLabel}
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <aside className="lg:col-span-2 space-y-4">
          {task.scraped && (
            <Section title="Produk">
              {task.scraped.imageUrls[0] && (
                <img
                  src={task.scraped.imageUrls[0]}
                  alt=""
                  className="w-full rounded-xl object-cover max-h-48 mb-3 border border-border"
                  loading="lazy"
                />
              )}
              <p className="font-semibold text-sm text-foreground leading-snug">{task.scraped.name}</p>
              {task.scraped.category && (
                <p className="inline-flex items-center gap-1 text-xs text-muted-foreground mt-1.5">
                  <Tag className="w-3 h-3" /> {task.scraped.category}
                </p>
              )}
              {task.scraped.price && (
                <p className="text-sm font-semibold text-violet-600 dark:text-violet-300 mt-2">{task.scraped.price}</p>
              )}
              {task.scraped.description && (
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed line-clamp-4">{task.scraped.description}</p>
              )}
              {task.input.productLink && (
                <a
                  href={task.input.productLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 transition-colors"
                >
                  Lihat di Shopee <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </Section>
          )}

          {task.productAnalysis && (
            <Section title="Analisis Produk">
              <div className="space-y-1">
                <MiniRow label="Kategori"     value={task.productAnalysis.category} />
                <MiniRow label="Target Pasar" value={task.productAnalysis.target_market} />
                <MiniRow label="Confidence"   value={task.productAnalysis.confidence} />
                <MiniRow
                  label="Mode"
                  value={task.input.needCharacter === false ? 'Produk Only' : task.input.needCharacter === true ? 'Ada Karakter' : 'Auto'}
                />
              </div>

              {task.productAnalysis.strengths?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-wider">Strengths</p>
                  <div className="flex flex-wrap gap-1.5">
                    {task.productAnalysis.strengths.map((p: string, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-violet-500/10 border border-violet-500/20 rounded-md text-[11px] font-medium text-violet-700 dark:text-violet-300"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {task.productAnalysis.ugc_angles?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-wider">UGC Angles</p>
                  <div className="flex flex-wrap gap-1.5">
                    {task.productAnalysis.ugc_angles.map((p: string, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-[11px] font-medium text-emerald-700 dark:text-emerald-300"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Section>
          )}

          {task.creative && (
            <Section title="Creative Concept">
              <p className="text-sm text-foreground leading-relaxed italic mb-3 pl-3 border-l-2 border-violet-500/40">
                "{task.creative.creative_concept}"
              </p>
              <div className="space-y-2">
                <SceneRow label="Style"   value={task.creative.content_style} />
                <SceneRow label="Emotion" value={task.creative.emotion_trigger} />
                <SceneRow label="Goal"    value={task.creative.content_goal} />
              </div>
            </Section>
          )}

          {task.selectedHook && (
            <Section title="Hook Terpilih">
              <div className="p-3 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 border border-violet-500/20 rounded-xl">
                <p className="text-sm text-foreground italic leading-relaxed">"{task.selectedHook}"</p>
              </div>
            </Section>
          )}
        </aside>

        <div className="lg:col-span-3 space-y-4">
          {imgs.length > 0 && currentImg ? (
            <Section title={`Start Frame · ${imgs.length} gambar`}>
              <div className="relative rounded-xl overflow-hidden bg-muted/30 mb-3 border border-border">
                <img
                  src={currentImg.url}
                  alt="Start frame yang digenerate"
                  className="w-full object-contain max-h-[520px]"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-background/85 backdrop-blur-md border border-border rounded-lg text-[11px] font-bold text-foreground">
                    <ImageIcon className="w-3 h-3 text-violet-500" />
                    <span className="tabular-nums">{safeIdx + 1} / {imgs.length}</span>
                  </span>
                </div>
                <a
                  href={currentImg.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Buka gambar di tab baru"
                  className="absolute top-3 right-3 w-8 h-8 bg-background/85 backdrop-blur-md border border-border rounded-lg flex items-center justify-center hover:bg-background hover:border-violet-500/40 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {imgs.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 mb-4 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:bg-violet-500/30 [&::-webkit-scrollbar-thumb]:rounded-full">
                  {imgs.map((img: GeneratedImage, i: number) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setSelectedImg(i)}
                      aria-label={`Lihat gambar ${i + 1}`}
                      aria-current={i === safeIdx}
                      className={`shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                        i === safeIdx
                          ? 'border-violet-500 scale-105 shadow-md shadow-violet-500/25'
                          : 'border-transparent opacity-60 hover:opacity-100 hover:border-violet-500/40'
                      }`}
                    >
                      <img src={img.url} alt="" className="w-14 h-14 object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => copy(currentImg.prompt, 'Image prompt disalin!')}
                className="w-full text-left p-4 bg-card/50 border border-border rounded-xl hover:border-violet-500/40 hover:bg-muted/50 transition-colors group focus-visible:ring-2 focus-visible:ring-violet-500/40"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Prompt Gambar (Leonardo)</p>
                  <Copy className="w-3.5 h-3.5 text-muted-foreground group-hover:text-violet-500 transition-colors" />
                </div>
                <p className="text-xs text-foreground leading-relaxed line-clamp-3 font-mono">{currentImg.prompt}</p>
              </button>

              {(currentImg.clip1 || currentImg.clip2) && (
                <div className="mt-5 pt-5 border-t border-border space-y-3">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Video className="w-4 h-4 text-violet-500" /> Video Prompts (20 detik)
                  </h4>

                  {currentImg.fullScene && (
                    <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">Scene Summary</p>
                      <p className="text-xs text-foreground leading-relaxed">{currentImg.fullScene}</p>
                    </div>
                  )}

                  {currentImg.clip1 && (
                    <ClipBlock
                      label="Clip 1"
                      timing="0s — 10s"
                      prompt={currentImg.clip1.prompt}
                      endFrame={currentImg.clip1.endFrame}
                      notes={currentImg.clip1.notes}
                    />
                  )}

                  {currentImg.clip2 && (
                    <ClipBlock
                      label="Clip 2"
                      timing="10s — 20s"
                      prompt={currentImg.clip2.prompt}
                      endFrame={currentImg.clip2.endFrame}
                      notes={currentImg.clip2.notes}
                    />
                  )}
                </div>
              )}

              <p className="text-[10px] text-muted-foreground text-right mt-4 font-medium tabular-nums">
                Digenerate {new Date(currentImg.createdAt).toLocaleTimeString('id-ID')}
              </p>
            </Section>
          ) : (
            <Section title="Start Frame">
              <div className="py-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-muted/40 border border-border flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-semibold text-foreground mb-1">Belum ada gambar</p>
                <p className="text-xs text-muted-foreground mb-4">Lanjutkan pipeline untuk generate start frame.</p>
                <Link
                  href="/dashboard/new"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-violet-500/25"
                >
                  <Sparkles className="w-4 h-4" /> Buat Tugas Baru
                </Link>
              </div>
            </Section>
          )}
        </div>
      </div>
    </PageShell>
  )
}

function ClipBlock({
  label, timing, prompt, endFrame, notes,
}: {
  label: string
  timing: string
  prompt: string
  endFrame?: string
  notes?: string
}) {
  return (
    <div className="p-4 bg-card/50 border border-border rounded-xl space-y-3 hover:border-violet-500/30 transition-colors">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-300 shrink-0">{label}</span>
          <span className="text-[10px] font-mono font-semibold text-muted-foreground tabular-nums px-1.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/20">
            {timing}
          </span>
        </div>
        <button
          type="button"
          onClick={() => copy(prompt, `${label} disalin!`)}
          aria-label={`Salin ${label}`}
          className="shrink-0 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/20 text-violet-600 dark:text-violet-300 text-[11px] font-semibold transition-colors"
        >
          <Copy className="w-3 h-3" /> Salin
        </button>
      </div>
      <p className="text-xs text-foreground leading-relaxed font-mono whitespace-pre-wrap break-words">{prompt}</p>
      {(endFrame || notes) && (
        <div className="pt-3 border-t border-border text-xs text-muted-foreground space-y-1.5">
          {endFrame && <p><strong className="text-foreground/80">End Frame:</strong> {endFrame}</p>}
          {notes && <p><strong className="text-foreground/80">Catatan:</strong> {notes}</p>}
        </div>
      )}
    </div>
  )
}
