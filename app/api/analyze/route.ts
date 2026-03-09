// app/api/analyze/route.ts
// Step 1 — Product Analysis (Pineapple Product Analyst)
// Input : ScrapedProduct + foto produk + (opsional) reference video frames
// Output: ProductAnalysis JSON

import { NextRequest, NextResponse } from 'next/server'
import { getProductAnalysisPrompt } from '@/lib/prompts'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { product, targetMarket, referenceFrames, openaiApiKey } = await req.json()

    if (!product || !openaiApiKey) {
      return NextResponse.json({ success: false, error: 'Data tidak lengkap' }, { status: 400 })
    }

    const hasRefVideo = Array.isArray(referenceFrames) && referenceFrames.length > 0

    const prompt = getProductAnalysisPrompt(
      product.name,
      product.category,
      product.description,
      targetMarket || '',
      hasRefVideo
    )

    // Build user content: teks + foto produk + (opsional) frame video
    const userContent: any[] = [{ type: 'text', text: prompt }]

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

    // ── LOG ──────────────────────────────────────────────────────────────────
    console.log('\n━━━ [analyze] SYSTEM PROMPT ━━━')
    console.log('ROLE: Pineapple Product Analyst')
    console.log('\n━━━ [analyze] USER PROMPT ━━━')
    console.log(prompt)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-5-nano',
        max_completion_tokens: 3000,
        reasoning_effort: 'low',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: 'You are a Pineapple Product Analyst specializing in Indonesian UGC marketing.' },
          { role: 'user', content: userContent },
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
      const usage = json.usage
      throw new Error(`GPT content kosong. finish_reason: ${finish}, tokens: ${usage?.completion_tokens}/${usage?.total_tokens}`)
    }

    console.log('\n━━━ [analyze] RESULT ━━━')
    console.log(rawContent)
    console.log(`tokens: ${json.usage?.total_tokens} (reasoning: ${json.usage?.completion_tokens_details?.reasoning_tokens ?? '?'})`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━\n')

    const result = JSON.parse(rawContent)
    return NextResponse.json({ success: true, data: result })
  } catch (err: any) {
    console.error('[analyze] error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}