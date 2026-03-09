// app/api/creative/route.ts
// Step 2 — Creative Director (Pineapple Creative Director)
// Input : ProductAnalysis
// Output: CreativeConcept JSON

import { NextRequest, NextResponse } from 'next/server'
import { getCreativeDirectorPrompt } from '@/lib/prompts'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { productAnalysis, openaiApiKey } = await req.json()

    if (!productAnalysis || !openaiApiKey) {
      return NextResponse.json({ success: false, error: 'Data tidak lengkap' }, { status: 400 })
    }

    const prompt = getCreativeDirectorPrompt(productAnalysis)

    console.log('\n━━━ [creative] USER PROMPT ━━━')
    console.log(prompt)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

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
          { role: 'system', content: 'You are a Pineapple Creative Director specializing in Indonesian UGC ad concepts for TikTok and Instagram Reels.' },
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
      const finish = json.choices?.[0]?.finish_reason
      throw new Error(`GPT content kosong. finish_reason: ${finish}`)
    }

    console.log('\n━━━ [creative] RESULT ━━━')
    console.log(rawContent)
    console.log(`tokens: ${json.usage?.total_tokens}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━\n')

    const result = JSON.parse(rawContent)
    return NextResponse.json({ success: true, data: result })
  } catch (err: any) {
    console.error('[creative] error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}