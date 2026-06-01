// app/api/generate-image/route.ts
// Dispatcher: Leonardo (multi-ref strength) atau OpenRouter (cheap, single-ref)
// Provider dipilih client via body.imageProvider

import { NextRequest, NextResponse } from 'next/server'
import { getImagePromptWithModel, getImagePromptProductOnly } from '@/lib/prompts'
import { getModelById, getBackgroundById } from '@/lib/models'
import { generateViaLeonardo, type ImageSlot } from '@/lib/image-providers/leonardo'
import { generateViaOpenRouter, type OpenRouterImageRef } from '@/lib/image-providers/openrouter'

export const maxDuration = 120
export const dynamic = 'force-dynamic'

type ImageProvider = 'leonardo' | 'openrouter'

export async function POST(req: NextRequest) {
  try {
    const {
      product,
      productAnalysis,
      creative,
      selectedHook,
      needCharacter,
      modelId,
      backgroundId,
      customPrompt,
      leonardoApiKey,
      openrouterApiKey,
      imageProvider,
      imageModel,
    } = await req.json()

    if (!product?.name || !Array.isArray(product?.imageUrls) || !product.imageUrls[0]) {
      return NextResponse.json({ success: false, error: 'Data produk tidak lengkap' }, { status: 400 })
    }

    const provider: ImageProvider = imageProvider === 'openrouter' ? 'openrouter' : 'leonardo'

    if (provider === 'leonardo' && !leonardoApiKey) {
      return NextResponse.json({ success: false, error: 'Leonardo API key diperlukan' }, { status: 400 })
    }
    if (provider === 'openrouter' && !openrouterApiKey) {
      return NextResponse.json({ success: false, error: 'OpenRouter API key diperlukan' }, { status: 400 })
    }

    const modelPreset = modelId ? getModelById(modelId) : null
    const bgPreset = backgroundId ? getBackgroundById(backgroundId) : null

    const setting = productAnalysis?.ugc_angles?.[0] || creative?.content_style || 'everyday setting'
    const action = creative?.creative_concept?.slice(0, 100) || 'using the product naturally'
    const hook = selectedHook || `Coba ${product.name}`

    const prompt = (() => {
      if (customPrompt) return customPrompt
      if (needCharacter && modelPreset) {
        return getImagePromptWithModel(
          product.name, setting, action, hook, modelPreset.gender, !!bgPreset
        )
      }
      return getImagePromptProductOnly(product.name, setting, action, hook, !!bgPreset)
    })()

    console.log(`\n━━━ [generate-image] provider=${provider} ━━━`)
    console.log(prompt)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    if (provider === 'leonardo') {
      const slots: ImageSlot[] = needCharacter && modelPreset
        ? [
            { url: product.imageUrls?.[0] ?? null, strength: 'HIGH', label: 'product'    },
            { url: modelPreset.url,                strength: 'MID',  label: 'model'      },
            { url: bgPreset?.url ?? null,          strength: 'HIGH', label: 'background' },
          ]
        : [
            { url: product.imageUrls?.[0] ?? null, strength: 'HIGH', label: 'product'    },
            { url: bgPreset?.url ?? null,          strength: 'HIGH', label: 'background' },
          ]

      const result = await generateViaLeonardo({
        prompt,
        apiKey: leonardoApiKey,
        slots,
        signal: req.signal,
      })

      return NextResponse.json({
        success: true,
        data: {
          id: result.id,
          url: result.url,
          prompt,
          modelId: modelPreset?.id || null,
          backgroundId: bgPreset?.id || null,
          provider,
          createdAt: Date.now(),
        },
      })
    }

    // ── OpenRouter path ─────────────────────────────────────────────────────
    const refs: OpenRouterImageRef[] = []
    if (product.imageUrls?.[0]) refs.push({ url: product.imageUrls[0], label: 'product' })
    if (needCharacter && modelPreset?.url) refs.push({ url: modelPreset.url, label: 'model' })
    if (bgPreset?.url) refs.push({ url: bgPreset.url, label: 'background' })

    const orModel = imageModel || 'google/gemini-2.5-flash-image'
    const result = await generateViaOpenRouter({
      model: orModel,
      prompt,
      apiKey: openrouterApiKey,
      refs,
      signal: req.signal,
    })

    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        url: result.url,
        prompt,
        modelId: modelPreset?.id || null,
        backgroundId: bgPreset?.id || null,
        provider,
        imageModel: orModel,
        createdAt: Date.now(),
      },
    })
  } catch (err: any) {
    console.error('[generate-image] error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
