// app/api/pipeline-stream/route.ts
// SSE — runs analyze → creative+hooks pipeline server-side.
// Client uses EventSource to receive {step, status, data, usage} events in real-time.

import { NextRequest } from 'next/server'
import { getProductAnalysisPrompt, getCreativeAndHooksPrompt } from '@/lib/prompts'
import {
  createOpenRouterClient, modelFor, temperatureFor, normalizeTier,
  parseAiJson, ensureContent, ChatContentPart,
} from '@/lib/openrouter'

export const maxDuration = 120
export const dynamic = 'force-dynamic'

const MAX_WORDS = 10
const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length
const sanitizeHooks = (arr: unknown[]): string[] =>
  arr.map((h) => String(h).trim()).filter(Boolean).filter((h) => wordCount(h) <= MAX_WORDS)

interface PipelineEvent {
  step: 'analyze' | 'creative_hooks' | 'done'
  status: 'running' | 'success' | 'error'
  data?: any
  usage?: any
  error?: string
}

function sseLine(event: PipelineEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { product, targetMarket, referenceFrames, openrouterApiKey, qualityTier } = body

  if (!product || !openrouterApiKey) {
    return new Response(
      JSON.stringify({ success: false, error: 'Data tidak lengkap' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const tier = normalizeTier(qualityTier)

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder()
      const send = (e: PipelineEvent) => controller.enqueue(enc.encode(sseLine(e)))

      try {
        const client = createOpenRouterClient(openrouterApiKey)

        // ── Step 1: analyze ───────────────────────────────────────────────
        send({ step: 'analyze', status: 'running' })
        const hasRefVideo = Array.isArray(referenceFrames) && referenceFrames.length > 0
        const analyzePrompt = getProductAnalysisPrompt(
          product.name,
          product.category,
          product.description,
          targetMarket || '',
          hasRefVideo
        )
        const analyzeContent: ChatContentPart[] = [{ type: 'text', text: analyzePrompt }]
        for (const url of (product.imageUrls || []).slice(0, 3)) {
          analyzeContent.push({ type: 'image_url', image_url: { url, detail: 'low' } })
        }
        if (hasRefVideo) {
          analyzeContent.push({ type: 'text', text: 'REFERENCE VIDEO FRAMES:' })
          for (const f of referenceFrames) {
            analyzeContent.push({ type: 'image_url', image_url: { url: f, detail: 'low' } })
          }
        }
        const analyzeRes = await client.chat.completions.create({
          model: modelFor('vision_analyze', tier),
          max_tokens: 3000,
          temperature: temperatureFor('vision_analyze'),
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: 'You are a PromptCraft Product Analyst. Output target_market, strengths, weaknesses, ugc_angles in Bahasa Indonesia.' },
            { role: 'user', content: analyzeContent },
          ],
        })
        const aChoice = analyzeRes.choices?.[0]
        ensureContent(aChoice?.message?.content, aChoice?.finish_reason, analyzeRes.usage, '[stream:analyze]')
        const analyzeData = parseAiJson(aChoice!.message!.content!)
        send({ step: 'analyze', status: 'success', data: analyzeData, usage: analyzeRes.usage })

        // ── Step 2+3: creative+hooks (merged) ─────────────────────────────
        send({ step: 'creative_hooks', status: 'running' })
        const chRes = await client.chat.completions.create({
          model: modelFor('creative_copy', tier),
          max_tokens: 3000,
          temperature: temperatureFor('creative_copy'),
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: 'You are a PromptCraft Creative Director + viral copywriter for Indonesian TikTok/Reels. Output strict JSON only. Hooks ≤10 kata, bahasa Indonesia gaul.' },
            { role: 'user', content: getCreativeAndHooksPrompt(analyzeData) },
          ],
        })
        const chChoice = chRes.choices?.[0]
        ensureContent(chChoice?.message?.content, chChoice?.finish_reason, chRes.usage, '[stream:creative_hooks]')
        const chRaw = parseAiJson<any>(chChoice!.message!.content!)

        const allHooks = sanitizeHooks(Array.isArray(chRaw?.hooks) ? chRaw.hooks : [])
        const top5Sanitized = sanitizeHooks(Array.isArray(chRaw?.hooks_top5) ? chRaw.hooks_top5 : [])
        const top5 = top5Sanitized.length === 5 ? top5Sanitized : allHooks.slice(0, 5)

        send({
          step: 'creative_hooks',
          status: 'success',
          data: { creative: chRaw.creative, hooks: { hooks: top5 }, hooks_all: allHooks },
          usage: chRes.usage,
        })

        send({ step: 'done', status: 'success' })
        controller.close()
      } catch (err: any) {
        send({ step: 'done', status: 'error', error: err?.message || 'Pipeline error' })
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
