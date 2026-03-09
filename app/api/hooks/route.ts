// app/api/hooks/route.ts
// Step 3 — Hook Generator (Pineapple Hook Generator)
// Input : ProductAnalysis + CreativeConcept
// Output: { hooks: string[] } — 5 hook options

import { NextRequest, NextResponse } from 'next/server'
import { getHookGeneratorPrompt } from '@/lib/prompts'

export const maxDuration = 30
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { productAnalysis, creative, openaiApiKey } = await req.json()

    if (!productAnalysis || !creative || !openaiApiKey) {
      return NextResponse.json({ success: false, error: 'Data tidak lengkap' }, { status: 400 })
    }

    const prompt = getHookGeneratorPrompt(productAnalysis, creative)

    console.log('\n━━━ [hooks] PROMPT ━━━')
    console.log(prompt)
    console.log('━━━━━━━━━━━━━━━━━━━━━━\n')

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-5-nano',
        // ── Dinaikkan: hooks cuma 5 string pendek tapi reasoning model
        //    butuh token untuk berpikir sebelum output → 2000 cukup aman
        max_completion_tokens: 2000,
        reasoning_effort: 'low',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: 'Kamu adalah copywriter UGC viral. Balas HANYA dengan JSON valid, tanpa teks lain.',
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
    const finishReason = json.choices?.[0]?.finish_reason
    const usage = json.usage

    console.log(`[hooks] finish_reason: ${finishReason} | tokens: ${usage?.total_tokens} (completion: ${usage?.completion_tokens})`)

    if (!rawContent) {
      // finish_reason: length = token habis sebelum selesai
      // finish_reason: content_filter = konten diblokir
      throw new Error(
        finishReason === 'length'
          ? `Token habis sebelum selesai (${usage?.completion_tokens} tokens). Coba lagi.`
          : `GPT tidak menghasilkan konten. finish_reason: ${finishReason}`
      )
    }

    console.log('\n━━━ [hooks] RESULT ━━━')
    console.log(rawContent)
    console.log('━━━━━━━━━━━━━━━━━━━━━━\n')

    let result: any
    try {
      result = JSON.parse(rawContent)
    } catch {
      // Kadang model wraps dengan markdown ```json — strip dulu
      const cleaned = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      result = JSON.parse(cleaned)
    }

    // Pastikan format benar — array of 5 strings
    if (!Array.isArray(result?.hooks) || result.hooks.length === 0) {
      throw new Error('Format hooks tidak valid dari GPT')
    }

    // Trim dan pastikan maks 5
    result.hooks = result.hooks.slice(0, 5).map((h: string) => String(h).trim())

    return NextResponse.json({ success: true, data: result })
  } catch (err: any) {
    console.error('[hooks] error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}