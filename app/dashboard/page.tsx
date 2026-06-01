'use client'

import { useAppContext } from '@/lib/context'
import { getStatusPresentation } from '@/lib/status'
import { StatCard } from '@/components/dashboard/primitives'
import { PageShell, PageHeader, EmptyState } from '@/components/dashboard/page-shell'
import Link from 'next/link'
import {
  Plus, Sparkles, CheckCircle2, Clock, AlertCircle, ImageIcon,
  ArrowRight, Zap, Link2, Bot, Wand2, Film,
} from 'lucide-react'

const PIPELINE_STEPS = [
  { n: 1, title: 'Scrape Shopee',  desc: 'Tarik nama, harga, foto, deskripsi otomatis dari link produk.', Icon: Link2 },
  { n: 2, title: 'Analisis AI',    desc: 'GPT vision baca produk → target market + creative concept.',   Icon: Bot },
  { n: 3, title: 'Start Frame',    desc: 'Leonardo Phoenix render gambar pembuka berdasarkan scene.',     Icon: Wand2 },
  { n: 4, title: 'Video Prompt',   desc: 'Susun script 20 detik + dual-clip prompt siap untuk Veo3.',     Icon: Film },
] as const

export default function DashboardPage() {
  const { tasks, settings } = useAppContext()

  const finished     = tasks.filter(t => t.status === 'finished').length
  const withImages   = tasks.filter(t => (t.generatedImages?.length || 0) > 0).length
  const analyzed     = tasks.filter(t => !!t.productAnalysis).length
  const hasApiKeys   = !!settings.openrouterApiKey && !!settings.leonardoApiKey

  return (
    <PageShell maxWidth="xl">
      <PageHeader
        title="Dashboard"
        description="Pipeline UGC otomatis dari link Shopee ke prompt Veo3."
        action={
          <Link
            href="/dashboard/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-violet-500/25 focus-visible:ring-2 focus-visible:ring-violet-500/50"
          >
            <Plus className="w-4 h-4" />
            Tugas Baru
          </Link>
        }
      />

      <div className="space-y-8">
        {!hasApiKeys && (
          <Link
            href="/dashboard/settings"
            className="group flex items-center gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl hover:border-amber-500/40 hover:bg-amber-500/10 transition-colors focus-visible:ring-2 focus-visible:ring-amber-500/40"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">API Key belum dikonfigurasi</p>
              <p className="text-xs text-amber-700/70 dark:text-amber-400/70 mt-0.5">
                Isi OpenRouter & Leonardo API key untuk mulai pipeline.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}

        <section aria-label="Statistik">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard value={tasks.length} label="Total Tugas"    icon={<Clock />}        accent="violet"  />
            <StatCard value={withImages}   label="Punya Gambar"   icon={<ImageIcon />}    accent="blue"    />
            <StatCard value={finished}     label="Selesai"        icon={<CheckCircle2 />} accent="emerald" />
            <StatCard value={analyzed}     label="Teranalisis"    icon={<Sparkles />}     accent="amber"   />
          </div>
        </section>

        {tasks.length === 0 ? (
          <section className="glass-card rounded-2xl p-6 sm:p-10">
            <div className="max-w-xl mx-auto text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 mb-4">
                <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-300">Cara Kerja</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Empat langkah ke video UGC</h2>
              <p className="text-sm text-muted-foreground">Dari paste link sampai prompt video siap render — sekitar 90 detik.</p>
            </div>

            <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {PIPELINE_STEPS.map(({ n, title, desc, Icon }) => (
                <li
                  key={n}
                  className="relative bg-card/50 border border-border rounded-xl p-5 hover:border-violet-500/30 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground tabular-nums">
                      Step {n}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-foreground mb-1.5">{title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </li>
              ))}
            </ol>

            <div className="mt-8 flex justify-center">
              <Link
                href="/dashboard/new"
                className="inline-flex items-center gap-2 px-5 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold transition-all shadow-md shadow-violet-500/25 focus-visible:ring-2 focus-visible:ring-violet-500/50"
              >
                <Zap className="w-4 h-4" />
                Mulai Pipeline
              </Link>
            </div>
          </section>
        ) : (
          <section aria-label="Tugas terbaru" className="glass-card rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border">
              <h2 className="text-sm font-bold text-foreground">Tugas Terbaru</h2>
              <Link
                href="/dashboard/tasks"
                className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors flex items-center gap-1"
              >
                Lihat semua <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <ul className="divide-y divide-border">
              {tasks.slice(0, 8).map((task) => {
                const cfg = getStatusPresentation(task.status)
                const imgCount = task.generatedImages?.length || 0
                const thumb = task.generatedImages?.[0]?.url || task.scraped?.imageUrls?.[0]

                return (
                  <li key={task.id}>
                    <Link
                      href={`/dashboard/tasks/${task.id}`}
                      className="flex items-center gap-4 px-5 sm:px-6 py-4 hover:bg-muted/50 transition-colors group focus-visible:ring-2 focus-visible:ring-violet-500/40 focus-visible:ring-inset"
                    >
                      <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden shrink-0 border border-border">
                        {thumb ? (
                          <img src={thumb} alt="" className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors">
                          {task.scraped?.name || 'Tugas tanpa nama'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                          {new Date(task.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {imgCount > 0 && <> · {imgCount} gambar</>}
                        </p>
                      </div>

                      <span className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.chip}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        )}
      </div>
    </PageShell>
  )
}
