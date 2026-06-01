'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import type { Task } from '@/lib/types'
import type { QualityTier } from '@/lib/openrouter'

interface AppSettings {
  openrouterApiKey: string
  leonardoApiKey: string
  qualityTier: QualityTier
  imageProvider: 'leonardo' | 'openrouter'
  imageModel: string
}

interface AppContextValue {
  tasks: Task[]
  settings: AppSettings
  hydrated: boolean
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  removeTask: (id: string) => void
  setSettings: (s: AppSettings) => void
}

const AppContext = createContext<AppContextValue | null>(null)

const TASKS_KEY = 'ugc_tasks_v2'
const SETTINGS_KEY = 'ugc_settings_v2'

const DEFAULT_SETTINGS: AppSettings = {
  openrouterApiKey: '',
  leonardoApiKey: '',
  qualityTier: 'balanced',
  imageProvider: 'leonardo',
  imageModel: 'google/gemini-2.5-flash-image',
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [settings, setSettingsState] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    setTasks(safeParse<Task[]>(localStorage.getItem(TASKS_KEY), []))
    setSettingsState({
      ...DEFAULT_SETTINGS,
      ...safeParse<Partial<AppSettings>>(localStorage.getItem(SETTINGS_KEY), {}),
    })
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
    } catch {}
  }, [tasks, hydrated])

  const addTask = useCallback((task: Task) => {
    setTasks((prev) => {
      const idx = prev.findIndex((t) => t.id === task.id)
      if (idx >= 0) {
        const next = prev.slice()
        next[idx] = { ...prev[idx], ...task, updatedAt: Date.now() }
        return next
      }
      return [task, ...prev]
    })
  }, [])

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t))
    )
  }, [])

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const setSettings = useCallback((s: AppSettings) => {
    setSettingsState(s)
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
    } catch {}
  }, [])

  const value = useMemo<AppContextValue>(
    () => ({ tasks, settings, hydrated, addTask, updateTask, removeTask, setSettings }),
    [tasks, settings, hydrated, addTask, updateTask, removeTask, setSettings]
  )

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used within AppProvider')
  return ctx
}
