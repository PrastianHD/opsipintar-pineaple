// app/api/scene-analyze/route.ts
// Step 6 — Scene Analyzer

import { NextRequest, NextResponse } from 'next/server'
import { getSceneAnalyzerPrompt } from '@/lib/prompts'
import {
  createOpenRouterClient, modelFor, temperatureFor, normalizeTier,
  parseAiJson, ensureContent,
} from '@/lib/openrouter'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, productName, hasCharacter, openrouterApiKey, qualityTier } = await req.json()

    if (!imageUrl || !openrouterApiKey) {
      return NextResponse.json({ success: false, error: 'Data tidak lengkap' }, { status: 400 })
    }

    const tier = normalizeTier(qualityTier)
    const prompt = getSceneAnalyzerPrompt(productName || 'product', hasCharacter ?? false)
    const client = createOpenRouterClient(openrouterApiKey)

    const completion = await client.chat.completions.create({
      model: modelFor('scene_vision', tier),
      max_tokens: 2000,
      temperature: temperatureFor('scene_vision'),
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: hasCharacter
            ? 'You are a UGC scene analyst. Analyze the creator and product in this image for video planning. Output English.'
            : 'You are a cinematic product shot analyst. This is a PRODUCT-ONLY image — no humans present. Analyze for camera movement planning only. Output English.',
        },
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } },
            { type: 'text', text: prompt },
          ],
        },
      ],
    })

    const choice = completion.choices?.[0]
    ensureContent(choice?.message?.content, choice?.finish_reason, completion.usage, '[scene-analyze]')

    const result = parseAiJson<Record<string, any>>(choice!.message!.content!)

    if (!hasCharacter) {
      result.characters = 'no characters — product only'
    }

    return NextResponse.json({ success: true, data: result, usage: completion.usage })
  } catch (err: any) {
    console.error('[scene-analyze] error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
