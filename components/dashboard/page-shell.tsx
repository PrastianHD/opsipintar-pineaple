'use client'

import { cn } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'

interface PageShellProps {
  children: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const MAX_WIDTH = {
  sm: 'max-w-2xl',
  md: 'max-w-3xl',
  lg: 'max-w-4xl',
  xl: 'max-w-5xl',
}

export function PageShell({ children, maxWidth = 'lg', className }: PageShellProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background text-foreground relative isolate">
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.04)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_40%,transparent_100%)]"
      />
      <div
        aria-hidden
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[640px] h-[320px] bg-violet-500/10 blur-[120px] rounded-full pointer-events-none -z-10"
      />
      <div className={cn('relative mx-auto px-4 sm:px-6 py-8 sm:py-10', MAX_WIDTH[maxWidth], className)}>
        {children}
      </div>
    </div>
  )
}

interface PageHeaderProps {
  title: string
  description?: string
  back?: { href: string; label?: string }
  action?: ReactNode
  badge?: ReactNode
  className?: string
}

export function PageHeader({ title, description, back, action, badge, className }: PageHeaderProps) {
  return (
    <header className={cn('mb-8 flex flex-col sm:flex-row sm:items-end gap-4 sm:justify-between', className)}>
      <div className="flex items-start gap-3 min-w-0">
        {back && (
          <Link
            href={back.href}
            aria-label={back.label || 'Kembali'}
            className="mt-1 w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-muted hover:border-violet-500/40 transition-all focus-visible:ring-2 focus-visible:ring-violet-500/50 shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{title}</h1>
            {badge}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  )
}

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('glass-card rounded-2xl p-12 sm:p-16 text-center', className)}>
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-5 text-violet-500 [&>svg]:w-8 [&>svg]:h-8 sm:[&>svg]:w-10 sm:[&>svg]:h-10">
        {icon}
      </div>
      <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2">{title}</h2>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6 leading-relaxed">{description}</p>
      )}
      {action}
    </div>
  )
}
