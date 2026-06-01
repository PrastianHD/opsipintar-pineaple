'use client'

import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface InfoCardProps {
  label: string
  value: string
  className?: string
}

export function InfoCard({ label, value, className }: InfoCardProps) {
  return (
    <div className={cn('bg-card border border-border rounded-xl p-3 transition-colors hover:border-violet-500/30', className)}>
      <p className="text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-foreground leading-snug">{value}</p>
    </div>
  )
}

interface MiniRowProps {
  label: string
  value: string
}

export function MiniRow({ label, value }: MiniRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1">
      <p className="text-xs font-medium text-muted-foreground shrink-0">{label}</p>
      <p className="text-sm font-medium text-foreground text-right capitalize truncate">{value}</p>
    </div>
  )
}

interface SceneRowProps {
  label: string
  value: string
}

export function SceneRow({ label, value }: SceneRowProps) {
  return (
    <div className="flex gap-3">
      <p className="text-xs font-medium text-muted-foreground w-14 shrink-0 mt-0.5">{label}</p>
      <p className="text-sm text-foreground leading-relaxed flex-1">{value}</p>
    </div>
  )
}

type Accent = 'violet' | 'emerald' | 'blue' | 'amber' | 'rose'

interface StatCardProps {
  value: number | string
  label: string
  icon: ReactNode
  accent?: Accent
  trend?: string
  className?: string
}

const STAT_VARIANTS: Record<Accent, { icon: string; bg: string; ring: string; value: string }> = {
  violet:  { icon: 'text-violet-500',  bg: 'bg-violet-500/10',  ring: 'group-hover:ring-violet-500/40',  value: 'text-foreground' },
  emerald: { icon: 'text-emerald-500', bg: 'bg-emerald-500/10', ring: 'group-hover:ring-emerald-500/40', value: 'text-foreground' },
  blue:    { icon: 'text-blue-500',    bg: 'bg-blue-500/10',    ring: 'group-hover:ring-blue-500/40',    value: 'text-foreground' },
  amber:   { icon: 'text-amber-500',   bg: 'bg-amber-500/10',   ring: 'group-hover:ring-amber-500/40',   value: 'text-foreground' },
  rose:    { icon: 'text-rose-500',    bg: 'bg-rose-500/10',    ring: 'group-hover:ring-rose-500/40',    value: 'text-foreground' },
}

export function StatCard({ value, label, icon, accent = 'violet', trend, className }: StatCardProps) {
  const v = STAT_VARIANTS[accent]
  return (
    <div className={cn('group glass-card rounded-2xl p-5 transition-all hover:-translate-y-0.5 ring-1 ring-transparent', v.ring, className)}>
      <div className="flex items-center justify-between mb-3">
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center [&>svg]:w-4 [&>svg]:h-4', v.bg, v.icon)}>
          {icon}
        </div>
        {trend && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{trend}</span>
        )}
      </div>
      <div className={cn('text-3xl font-bold tabular-nums leading-none', v.value)}>{value}</div>
      <p className="text-xs font-medium text-muted-foreground mt-2">{label}</p>
    </div>
  )
}
