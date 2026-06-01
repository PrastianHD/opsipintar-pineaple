'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Sparkles, PlusCircle, ListTodo, Settings, Menu, X, Sun, Moon, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Tugas Baru',    href: '/dashboard/new',      icon: PlusCircle },
  { label: 'Daftar Tugas',  href: '/dashboard/tasks',    icon: ListTodo   },
  { label: 'Pengaturan',    href: '/dashboard/settings', icon: Settings   },
]

function isActive(pathname: string, href: string): boolean {
  if (href === '/dashboard/tasks') {
    return pathname === href || pathname.startsWith('/dashboard/tasks/')
  }
  return pathname === href
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const next = theme === 'dark' ? 'light' : 'dark'
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={mounted ? `Ganti ke mode ${next}` : 'Ganti tema'}
      className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-muted hover:border-violet-500/40 transition-all focus-visible:ring-2 focus-visible:ring-violet-500/50"
    >
      {mounted && theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
    </button>
  )
}

export default function DashboardHeader() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => { setMobileOpen(false) }, [pathname])

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/dashboard" className="group flex items-center gap-2.5 shrink-0 focus-visible:ring-2 focus-visible:ring-violet-500/50 rounded-lg">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-md shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-shadow">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-base tracking-tight text-foreground">PromptCraft</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  active
                    ? 'bg-violet-500/10 text-violet-600 dark:text-violet-300 ring-1 ring-violet-500/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="hidden md:flex items-center gap-2 shrink-0">
          <ThemeToggle />
          <div className="text-right pr-1 pl-2 border-l border-border">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Paket</p>
            <p className="text-xs font-semibold text-foreground">Gratis</p>
          </div>
          <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-bold shadow-md shadow-violet-500/25 transition-all">
            <Zap className="w-3.5 h-3.5" />
            Upgrade
          </button>
        </div>

        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(v => !v)}
            className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-violet-500/50"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 top-16 bg-background/40 backdrop-blur-sm z-30"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <div className="md:hidden absolute top-full left-0 right-0 z-40 border-b border-border bg-background shadow-xl px-4 py-4 space-y-3">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(pathname, item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors',
                      active ? 'bg-violet-500/10 text-violet-600 dark:text-violet-300' : 'text-foreground hover:bg-muted'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Paket Gratis</p>
                <p className="text-xs text-muted-foreground">5 script / bulan</p>
              </div>
              <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-bold shadow-md transition-all">
                <Zap className="w-3.5 h-3.5" /> Upgrade
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  )
}
