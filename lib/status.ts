// lib/status.ts
// Centralized task status presentation. Single source of truth for label + dot + chip color.

import type { TaskStatus } from '@/lib/types'

export interface StatusPresentation {
  label: string
  dot: string
  chip: string
}

export const STATUS_PRESENTATION: Record<TaskStatus, StatusPresentation> = {
  pending: {
    label: 'Pending',
    dot: 'bg-yellow-400',
    chip: 'text-yellow-700 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  },
  analyzing: {
    label: 'Analyzing',
    dot: 'bg-blue-400 animate-pulse',
    chip: 'text-blue-700 dark:text-blue-400 bg-blue-500/10 border-blue-500/20',
  },
  creative: {
    label: 'Creative',
    dot: 'bg-blue-400 animate-pulse',
    chip: 'text-blue-700 dark:text-blue-400 bg-blue-500/10 border-blue-500/20',
  },
  hooks: {
    label: 'Hooks',
    dot: 'bg-blue-400 animate-pulse',
    chip: 'text-blue-700 dark:text-blue-400 bg-blue-500/10 border-blue-500/20',
  },
  generating: {
    label: 'Generating',
    dot: 'bg-violet-400 animate-pulse',
    chip: 'text-violet-700 dark:text-violet-400 bg-violet-500/10 border-violet-500/20',
  },
  scene_analyzing: {
    label: 'Scene Analyzing',
    dot: 'bg-violet-400 animate-pulse',
    chip: 'text-violet-700 dark:text-violet-400 bg-violet-500/10 border-violet-500/20',
  },
  video_scene: {
    label: 'Video Scene',
    dot: 'bg-violet-400 animate-pulse',
    chip: 'text-violet-700 dark:text-violet-400 bg-violet-500/10 border-violet-500/20',
  },
  scripting: {
    label: 'Scripting',
    dot: 'bg-violet-400 animate-pulse',
    chip: 'text-violet-700 dark:text-violet-400 bg-violet-500/10 border-violet-500/20',
  },
  finished: {
    label: 'Selesai',
    dot: 'bg-emerald-400',
    chip: 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  error: {
    label: 'Error',
    dot: 'bg-red-400',
    chip: 'text-red-700 dark:text-red-400 bg-red-500/10 border-red-500/20',
  },
}

export function getStatusPresentation(status: string): StatusPresentation {
  return STATUS_PRESENTATION[status as TaskStatus] || STATUS_PRESENTATION.pending
}
