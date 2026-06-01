// lib/openrouter.ts
// Shared OpenAI SDK client configured for OpenRouter + per-step model routing
// Usage: import { createOpenRouterClient, parseAiJson, modelFor } from '@/lib/openrouter'

import OpenAI from 'openai'

export type QualityTier = 'budget' | 'balanced' | 'premium'

export type ModelStep =
  | 'vision_analyze'
  | 'creative_copy'
  | 'scene_vision'
  | 'video_planning'
  | 'script_complex'

const MODEL_MATRIX: Record<QualityTier, Record<ModelStep, string>> = {
  budget: {
    vision_analyze:  'google/gemini-2.5-flash-lite',
    creative_copy:   'google/gemini-2.5-flash',
    scene_vision:    'google/gemini-2.5-flash-lite',
    video_planning:  'google/gemini-2.5-flash',
    script_complex:  'google/gemini-2.5-flash',
  },
  balanced: {
    vision_analyze:  'google/gemini-2.5-flash',
    creative_copy:   'anthropic/claude-haiku-4.5',
    scene_vision:    'google/gemini-2.5-flash',
    video_planning:  'anthropic/claude-haiku-4.5',
    script_complex:  'anthropic/claude-sonnet-4.5',
  },
  premium: {
    vision_analyze:  'google/gemma-4-31b-it:free',
    creative_copy:   'google/gemma-4-31b-it:free',
    scene_vision:    'google/gemma-4-31b-it:free',
    video_planning:  'google/gemma-4-31b-it:free',
    script_complex:  'google/gemma-4-31b-it:free',
  },
}

const TEMPERATURE_BY_STEP: Record<ModelStep, number> = {
  vision_analyze: 0.4,
  creative_copy:  1.0,
  scene_vision:   0.3,
  video_planning: 0.7,
  script_complex: 0.7,
}

export function modelFor(step: ModelStep, tier: QualityTier = 'balanced'): string {
  const matrix = MODEL_MATRIX[tier] ?? MODEL_MATRIX.balanced
  return matrix[step]
}

export function temperatureFor(step: ModelStep): number {
  return TEMPERATURE_BY_STEP[step]
}

export function normalizeTier(raw: unknown): QualityTier {
  return raw === 'budget' || raw === 'premium' ? raw : 'balanced'
}

export function createOpenRouterClient(apiKey: string) {
  return new OpenAI({
    apiKey,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': 'https://promptcraft.app',
      'X-Title': 'PromptCraft UGC',
    },
  })
}

// Strip markdown code fences sometimes returned despite response_format=json_object
export function parseAiJson<T = any>(raw: string): T {
  try {
    return JSON.parse(raw) as T
  } catch {
    const trimmed = raw.trim()
    const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)
    const candidate = fenceMatch ? fenceMatch[1] : trimmed
    return JSON.parse(candidate) as T
  }
}

// Throw an informative error when the model returns no content
export function ensureContent(
  raw: string | null | undefined,
  finishReason: string | null | undefined,
  usage?: { completion_tokens?: number; total_tokens?: number } | null,
  context = 'AI'
): asserts raw is string {
  if (raw) return
  const tokens = usage?.completion_tokens ?? 0
  const total = usage?.total_tokens ?? 0
  if (finishReason === 'length') {
    throw new Error(`${context} kehabisan token sebelum selesai (${tokens} tokens). Coba lagi.`)
  }
  throw new Error(`${context} tidak menghasilkan konten. finish_reason: ${finishReason ?? 'unknown'}, tokens: ${tokens}/${total}`)
}

export type ChatContentPart = OpenAI.Chat.Completions.ChatCompletionContentPart

// Backward-compat constant — use modelFor() going forward
export const MODEL = MODEL_MATRIX.balanced.creative_copy
