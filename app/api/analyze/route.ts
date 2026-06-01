// app/api/analyze/route.ts
// Step 1 — Product Analysis (PromptCraft Product Analyst)

import { NextRequest, NextResponse } from 'next/server'
import { getProductAnalysisPrompt } from '@/lib/prompts'
import {
  createOpenRouterClient, modelFor, temperatureFor, normalizeTier,
  parseAiJson, ensureContent, ChatContentPart,
} from '@/lib/openrouter'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { product, targetMarket, referenceFrames, openrouterApiKey, qualityTier } = await req.json()

    if (!product || !openrouterApiKey) {
      return NextResponse.json({ success: false, error: 'Data tidak lengkap' }, { status: 400 })
    }

    const tier = normalizeTier(qualityTier)
    const hasRefVideo = Array.isArray(referenceFrames) && referenceFrames.length > 0

    const prompt = getProductAnalysisPrompt(
      product.name,
      product.category,
      product.description,
      targetMarket || '',
      hasRefVideo
    )

    const userContent: ChatContentPart[] = [{ type: 'text', text: prompt }]

    const productImages = (product.imageUrls || []).slice(0, 3)
    for (const url of productImages) {
      userContent.push({ type: 'image_url', image_url: { url, detail: 'low' } })
    }

    if (hasRefVideo) {
      userContent.push({ type: 'text', text: 'REFERENCE VIDEO FRAMES (analyze style, hook, pacing):' })
      for (const frame of referenceFrames) {
        userContent.push({ type: 'image_url', image_url: { url: frame, detail: 'low' } })
      }
    }

    const client = createOpenRouterClient(openrouterApiKey)

    const completion = await client.chat.completions.create({
      model: modelFor('vision_analyze', tier),
      max_tokens: 3000,
      temperature: temperatureFor('vision_analyze'),
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You are a PromptCraft Product Analyst specializing in Indonesian UGC marketing. Output target_market, strengths, weaknesses, ugc_angles in Bahasa Indonesia.' },
        { role: 'user', content: userContent },
      ],
    })

    const choice = completion.choices?.[0]
    ensureContent(choice?.message?.content, choice?.finish_reason, completion.usage, '[analyze]')

    const result = parseAiJson(choice!.message!.content!)
    return NextResponse.json({ success: true, data: result, usage: completion.usage })
  } catch (err: any) {
    console.error('[analyze] error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
