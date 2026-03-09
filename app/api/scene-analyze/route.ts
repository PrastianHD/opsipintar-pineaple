// app/api/scene-analyze/route.ts
// Step 6 — Scene Analyzer (Pineapple Scene Analyst)
// Input : generated image URL (vision) + hasCharacter flag
// Output: SceneAnalysis JSON

import { NextRequest, NextResponse } from 'next/server'
import { getSceneAnalyzerPrompt } from '@/lib/prompts'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, productName, hasCharacter, openaiApiKey } = await req.json()

    if (!imageUrl || !openaiApiKey) {
      return NextResponse.json({ success: false, error: 'Data tidak lengkap' }, { status: 400 })
    }

    // ── hasCharacter diteruskan ke prompt agar motion_ideas sesuai ────────────
    const prompt = getSceneAnalyzerPrompt(productName || 'product', hasCharacter ?? false)

    console.log('\n━━━ [scene-analyze] PROMPT ━━━')
    console.log(prompt)
    console.log(`image: ${imageUrl}`)
    console.log(`hasCharacter: ${hasCharacter}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

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
            content: hasCharacter
              ? 'You are a UGC scene analyst. Analyze the creator and product in this image for video planning.'
              : 'You are a cinematic product shot analyst. This is a PRODUCT-ONLY image — no humans present. Analyze for camera movement planning only.',
          },
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } },
              { type: 'text', text: prompt },
            ],
          },
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

    console.log('\n━━━ [scene-analyze] RESULT ━━━')
    console.log(rawContent)
    console.log(`tokens: ${json.usage?.total_tokens}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    const result = JSON.parse(rawContent)

    // Safety: paksa karakter kosong jika product-only
    if (!hasCharacter) {
      result.characters = 'no characters — product only'
    }

    return NextResponse.json({ success: true, data: result })
  } catch (err: any) {
    console.error('[scene-analyze] error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}