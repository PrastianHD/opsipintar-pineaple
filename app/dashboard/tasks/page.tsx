'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useAppContext } from '@/lib/context'
import { getStatusPresentation, STATUS_PRESENTATION } from '@/lib/status'
import { PageShell, PageHeader, EmptyState } from '@/components/dashboard/page-shell'
import { Plus, Trash2, ImageIcon, ArrowRight, Search, X } from 'lucide-react'
import { toast } from 'sonner'
import type { TaskStatus } from '@/lib/types'

const FILTERS: Array<TaskStatus | 'all'> = ['all', 'analyzing', 'generating', 'finished', 'error']

export default function TasksListPage() {
  const { tasks, removeTask } = useAppContext()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return tasks.filter(t => {
      const name = (t.scraped?.name || '').toLowerCase()
      const matchSearch = !q || name.includes(q)
      const matchFilter = filter === 'all' || t.status === filter
      return matchSearch && matchFilter
    })
  }, [tasks, search, filter])

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    removeTask(id)
    toast.success('Tugas dihapus')
  }

  return (
    <PageShell maxWidth="xl">
      <PageHeader
        title="Semua Tugas"
        description={`${tasks.length} tugas total · ${filtered.length} ditampilkan`}
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

      {tasks.length > 0 && (
        <div className="flex flex-col lg:flex-row gap-3 mb-6">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama produk..."
              aria-label="Cari produk"
              className="w-full bg-card border border-border rounded-xl pl-11 pr-10 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all text-foreground"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Hapus pencarian"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 -mb-1 lg:pb-0 lg:mb-0 [&::-webkit-scrollbar]:hidden">
            {FILTERS.map(f => {
              const label = f === 'all' ? 'Semua' : (STATUS_PRESENTATION[f]?.label || f)
              const isActive = filter === f
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  aria-pressed={isActive}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 ${
                    isActive
                      ? 'bg-violet-600 border-violet-500 text-white shadow-sm'
                      : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-violet-500/30'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {tasks.length === 0 ? (
        <EmptyState
          icon={<ImageIcon />}
          title="Belum ada tugas"
          description="Mulai pipeline UGC pertama Anda dengan paste link Shopee."
          action={
            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-2 px-5 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-violet-500/25 focus-visible:ring-2 focus-visible:ring-violet-500/50"
            >
              <Plus className="w-4 h-4" />
              Buat Tugas Pertama
            </Link>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Search />}
          title="Tidak ada hasil"
          description={`Tidak ada tugas yang cocok dengan "${search || filter}". Coba kata kunci atau filter lain.`}
          action={
            <button
              type="button"
              onClick={() => { setSearch(''); setFilter('all') }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-card border border-border hover:border-violet-500/40 hover:bg-muted text-foreground rounded-xl text-sm font-semibold transition-all"
            >
              Reset filter
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(task => {
            const cfg = getStatusPresentation(task.status)
            const imgs = task.generatedImages || []
            const thumb = imgs[0]?.url || task.scraped?.imageUrls?.[0]

            return (
              <Link
                key={task.id}
                href={`/dashboard/tasks/${task.id}`}
                className="group glass-card rounded-2xl overflow-hidden transition-all hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/10 block focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:outline-none"
              >
                <div className="aspect-video bg-muted overflow-hidden relative border-b border-border">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

                  <span className={`absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur-md ${cfg.chip}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>

                  {imgs.length > 0 && (
                    <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-background/85 backdrop-blur-md border border-border/60 rounded-lg text-[11px] font-bold text-foreground">
                      <ImageIcon className="w-3 h-3 text-violet-500" />
                      {imgs.length}
                    </div>
                  )}
                </div>

                <div className="p-4 sm:p-5">
                  <p className="font-semibold text-sm text-foreground line-clamp-2 group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors mb-3 min-h-[2.5em]">
                    {task.scraped?.name || 'Tugas tanpa nama'}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-muted-foreground tabular-nums">
                      {new Date(task.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => handleDelete(task.id, e)}
                        aria-label="Hapus tugas"
                        className="w-8 h-8 rounded-lg hover:bg-rose-500/10 flex items-center justify-center text-muted-foreground hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center group-hover:bg-violet-600 group-hover:border-violet-500 transition-colors">
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </PageShell>
  )
}
