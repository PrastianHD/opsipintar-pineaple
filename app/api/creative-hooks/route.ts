// app/api/creative-hooks/route.ts
// Merged Step 2 + Step 3 — Creative Director + Hook Generator (10 hooks + top 5)
// Saves 1 round-trip vs calling /api/creative then /api/hooks serially.

import { NextRequest, NextResponse } from 'next/server'
import { getCreativeAndHooksPrompt } from '@/lib/prompts'
import {
  createOpenRouterClient, modelFor, temperatureFor, normalizeTier,
  parseAiJson, ensureContent,
} from '@/lib/openrouter'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

const MAX_WORDS = 10

function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length
}

function sanitizeHooks(arr: unknown[]): string[] {
  return arr
    .map((h) => String(h).trim())
    .filter(Boolean)
    .filter((h) => wordCount(h) <= MAX_WORDS)
}

export async function POST(req: NextRequest) {
  try {
    const { productAnalysis, openrouterApiKey, qualityTier } = await req.json()

    if (!productAnalysis || !openrouterApiKey) {
      return NextResponse.json({ success: false, error: 'Data tidak lengkap' }, { status: 400 })
    }

    const tier = normalizeTier(qualityTier)
    const prompt = getCreativeAndHooksPrompt(productAnalysis)
    const client = createOpenRouterClient(openrouterApiKey)

    const completion = await client.chat.completions.create({
      model: modelFor('creative_copy', tier),
      max_tokens: 3000,
      temperature: temperatureFor('creative_copy'),
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You are a PromptCraft Creative Director + viral copywriter for Indonesian TikTok/Reels. Output strict JSON only. Hooks ≤10 kata, bahasa Indonesia gaul.' },
        { role: 'user', content: prompt },
      ],
    })

    const choice = completion.choices?.[0]
    ensureContent(choice?.message?.content, choice?.finish_reason, completion.usage, '[creative-hooks]')

    const result = parseAiJson<{
      creative?: any
      hooks?: unknown
      hooks_top5?: unknown
    }>(choice!.message!.content!)

    if (!result?.creative) {
      throw new Error('Format response tidak valid — creative kosong')
    }

    const allHooksRaw = Array.isArray(result.hooks) ? result.hooks as unknown[] : []
    const allHooks = sanitizeHooks(allHooksRaw)

    if (allHooks.length === 0) {
      throw new Error('Format response tidak valid — hooks kosong')
    }

    const top5Raw = Array.isArray(result.hooks_top5) ? result.hooks_top5 as unknown[] : []
    const top5Sanitized = sanitizeHooks(top5Raw)

    const top5 = top5Sanitized.length === 5
      ? top5Sanitized
      : allHooks.slice(0, 5)

    return NextResponse.json({
      success: true,
      data: {
        creative: result.creative,
        hooks: { hooks: top5 },
        hooks_all: allHooks,
      },
      usage: completion.usage,
    })
  } catch (err: any) {
    console.error('[creative-hooks] error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
