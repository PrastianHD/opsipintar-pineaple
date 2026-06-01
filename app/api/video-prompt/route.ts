// app/api/video-prompt/route.ts
// Step 8 — UGC Script Writer

import { NextRequest, NextResponse } from 'next/server'
import { getUGCScriptSystemPrompt, getUGCScriptUserPrompt } from '@/lib/prompts'
import {
  createOpenRouterClient, modelFor, temperatureFor, normalizeTier,
  parseAiJson, ensureContent,
} from '@/lib/openrouter'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const {
      imageUrl,
      productName,
      productAnalysis,
      creative,
      sceneAnalysis,
      videoScene,
      selectedHook,
      hasCharacter,
      openrouterApiKey,
      qualityTier,
    } = await req.json()

    if (!imageUrl || !openrouterApiKey || !sceneAnalysis || !videoScene || !creative || !productAnalysis) {
      return NextResponse.json({ success: false, error: 'Data tidak lengkap' }, { status: 400 })
    }

    const tier = normalizeTier(qualityTier)
    const systemPrompt = getUGCScriptSystemPrompt(hasCharacter ?? false)
    const userPrompt = getUGCScriptUserPrompt(
      productName || 'product',
      sceneAnalysis,
      videoScene,
      creative,
      productAnalysis,
      selectedHook || ''
    )

    const client = createOpenRouterClient(openrouterApiKey)

    const completion = await client.chat.completions.create({
      model: modelFor('script_complex', tier),
      max_tokens: 2500,
      temperature: temperatureFor('script_complex'),
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } },
            { type: 'text', text: userPrompt },
          ],
        },
      ],
    })

    const choice = completion.choices?.[0]
    ensureContent(choice?.message?.content, choice?.finish_reason, completion.usage, '[video-prompt]')

    const result = parseAiJson<any>(choice!.message!.content!)

    if (!result?.clip1?.prompt || !result?.clip2?.prompt) {
      throw new Error('Response tidak lengkap — clip1 atau clip2 kosong')
    }

    return NextResponse.json({
      success: true,
      data: {
        hook: result.hook || '',
        problem: result.problem || '',
        solution: result.solution || '',
        product_demo: result.product_demo || '',
        cta: result.cta || '',
        clip1: {
          prompt: result.clip1.prompt,
          endFrame: result.clip1.endFrame || '',
          notes: result.clip1.notes || '',
          duration: '0–10 detik',
        },
        clip2: {
          prompt: result.clip2.prompt,
          notes: result.clip2.notes || '',
          duration: '10–20 detik',
        },
        fullScene: result.fullScene || '',
      },
      usage: completion.usage,
    })
  } catch (err: any) {
    console.error('[video-prompt] error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
