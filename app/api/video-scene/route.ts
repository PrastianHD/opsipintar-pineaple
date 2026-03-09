// app/api/video-scene/route.ts
// Step 7 — Video Scene Builder (Pineapple Video Scene Planner)
// Input : SceneAnalysis + ProductAnalysis + CreativeConcept + selectedHook
// Output: VideoScenePlan JSON

import { NextRequest, NextResponse } from 'next/server'
import { getVideoSceneBuilderPrompt } from '@/lib/prompts'

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
      openaiApiKey,
    } = await req.json()

    if (!sceneAnalysis || !openaiApiKey) {
      return NextResponse.json({ success: false, error: 'Data tidak lengkap' }, { status: 400 })
    }

    const prompt = getVideoSceneBuilderPrompt(
      productName || 'product',
      sceneAnalysis,
      creative,
      selectedHook || '',
      hasCharacter ?? false
    )

    console.log('\n━━━ [video-scene] PROMPT ━━━')
    console.log(prompt)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-5-nano',
        max_completion_tokens: 2000,
        reasoning_effort: 'low',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: 'You are a Pineapple Video Scene Planner. Convert image scenes into actionable UGC video plans for Google Gemini image-to-video.',
          },
          { role: 'user', content: prompt },
        ],
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.error?.message || `OpenAI error: ${res.status}`)
    }

    const json = await res.json()
    const rawContent = json.choices?.[0]?.message?.content

    if (!rawContent) {
      throw new Error(`GPT content kosong. finish_reason: ${json.choices?.[0]?.finish_reason}`)
    }

    console.log('\n━━━ [video-scene] RESULT ━━━')
    console.log(rawContent)
    console.log(`tokens: ${json.usage?.total_tokens}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    const result = JSON.parse(rawContent)
    return NextResponse.json({ success: true, data: result })
  } catch (err: any) {
    console.error('[video-scene] error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}