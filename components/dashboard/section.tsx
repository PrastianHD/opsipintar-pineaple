'use client'

import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface SectionProps {
  title?: ReactNode
  action?: ReactNode
  className?: string
  children: ReactNode
}

// Section: card frame for dashboard pages.
// Composition: render `action` slot in header for buttons/links.
export function Section({ title, action, className, children }: SectionProps) {
  return (
    <div className={cn('glass-card rounded-2xl p-6', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-5">
          {typeof title === 'string'
            ? <h3 className="text-sm font-bold text-foreground tracking-wide uppercase">{title}</h3>
            : title}
          {action}
        </div>
      )}
      {children}
    </div>
  )
}
