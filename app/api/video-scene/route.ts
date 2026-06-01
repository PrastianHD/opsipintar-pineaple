// app/api/video-scene/route.ts
// Step 7 — Video Scene Builder

import { NextRequest, NextResponse } from 'next/server'
import { getVideoSceneBuilderPrompt } from '@/lib/prompts'
import {
  createOpenRouterClient, modelFor, temperatureFor, normalizeTier,
  parseAiJson, ensureContent,
} from '@/lib/openrouter'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const {
      productName,
      sceneAnalysis,
      creative,
      selectedHook,
      hasCharacter,
      openrouterApiKey,
      qualityTier,
    } = await req.json()

    if (!sceneAnalysis || !openrouterApiKey) {
      return NextResponse.json({ success: false, error: 'Data tidak lengkap' }, { status: 400 })
    }

    const tier = normalizeTier(qualityTier)
    const prompt = getVideoSceneBuilderPrompt(
      productName || 'product',
      sceneAnalysis,
      creative,
      selectedHook || '',
      hasCharacter ?? false
    )

    const client = createOpenRouterClient(openrouterApiKey)

    const completion = await client.chat.completions.create({
      model: modelFor('video_planning', tier),
      max_tokens: 2000,
      temperature: temperatureFor('video_planning'),
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You are a PromptCraft Video Scene Planner. Convert image scenes into actionable UGC video plans for Veo3 / image-to-video. Output English JSON only.',
        },
        { role: 'user', content: prompt },
      ],
    })

    const choice = completion.choices?.[0]
    ensureContent(choice?.message?.content, choice?.finish_reason, completion.usage, '[video-scene]')

    const result = parseAiJson(choice!.message!.content!)
    return NextResponse.json({ success: true, data: result, usage: completion.usage })
  } catch (err: any) {
    console.error('[video-scene] error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
