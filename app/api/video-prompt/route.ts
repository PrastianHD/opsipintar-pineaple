// app/api/video-prompt/route.ts
// Step 8 — UGC Script Writer (Pineapple UGC Script Writer)
// Input : imageUrl (start frame) + semua data pipeline
// Output: UGCScript JSON (hook/problem/solution/demo/cta + clip1 + clip2)

import { NextRequest, NextResponse } from 'next/server'
import { getUGCScriptSystemPrompt, getUGCScriptUserPrompt } from '@/lib/prompts'

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
      openaiApiKey,
    } = await req.json()

    if (!imageUrl || !openaiApiKey) {
      return NextResponse.json({ success: false, error: 'Data tidak lengkap' }, { status: 400 })
    }

    const systemPrompt = getUGCScriptSystemPrompt(hasCharacter ?? false)
    const userPrompt = getUGCScriptUserPrompt(
      productName || 'product',
      sceneAnalysis,
      videoScene,
      creative,
      productAnalysis,
      selectedHook || ''
    )

    // ── LOG — copy ke playground untuk test model lain ────────────────────────
    console.log('\n━━━ [video-prompt] SYSTEM PROMPT ━━━')
    console.log(systemPrompt)
    console.log('\n━━━ [video-prompt] USER PROMPT ━━━')
    console.log(userPrompt)
    console.log('\n━━━ [video-prompt] IMAGE URL ━━━')
    console.log(imageUrl)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-5-nano',
        max_completion_tokens: 5000, // lebih besar — output panjang (script + 2 clip prompts)
        reasoning_effort: 'low',
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
      throw new Error(
        `GPT content kosong. finish_reason: ${finish}, tokens: ${usage?.completion_tokens}/${usage?.total_tokens}`
      )
    }

    console.log('\n━━━ [video-prompt] RESULT ━━━')
    console.log(rawContent)
    console.log(`tokens: ${json.usage?.total_tokens} (reasoning: ${json.usage?.completion_tokens_details?.reasoning_tokens ?? '?'})`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    const result = JSON.parse(rawContent)

    if (!result.clip1?.prompt || !result.clip2?.prompt) {
      throw new Error('Response tidak lengkap — clip1 atau clip2 kosong')
    }

    return NextResponse.json({
      success: true,
      data: {
        // Script structure
        hook:         result.hook        || '',
        problem:      result.problem     || '',
        solution:     result.solution    || '',
        product_demo: result.product_demo || '',
        cta:          result.cta         || '',
        // Gemini 2-clip prompts
        clip1: {
          prompt:   result.clip1.prompt,
          endFrame: result.clip1.endFrame || '',
          notes:    result.clip1.notes    || '',
          duration: '0–10 detik',
        },
        clip2: {
          prompt:   result.clip2.prompt,
          notes:    result.clip2.notes || '',
          duration: '10–20 detik',
        },
        fullScene: result.fullScene || '',
      },
    })
  } catch (err: any) {
    console.error('[video-prompt] error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}