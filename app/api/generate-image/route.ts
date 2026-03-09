// app/api/generate-image/route.ts
// Step 4 & 5 — Image Generator (Leonardo Nano Banana)
// Jalur 4: Model + Product + Background
// Jalur 5: Product Only + Background (opsional)
//
// Model & Background diambil dari Supabase Storage (URL publik)
// — tidak perlu upload manual dari user lagi

import { NextRequest, NextResponse } from 'next/server'
import { getImagePromptWithModel, getImagePromptProductOnly } from '@/lib/prompts'
import { getModelById, getBackgroundById } from '@/lib/models'
import type { ProductAnalysis, ScrapedProduct } from '@/lib/types'

export const maxDuration = 120
export const dynamic = 'force-dynamic'

const LEO_V1 = 'https://cloud.leonardo.ai/api/rest/v1'
const LEO_V2 = 'https://cloud.leonardo.ai/api/rest/v2'
const LEONARDO_MODEL = 'gemini-2.5-flash-image'
const IMG_WIDTH = 768
const IMG_HEIGHT = 1344
const STYLE_ID = '111dc692-d470-4eec-b791-3475abac4c46' // Dynamic style

type Strength = 'HIGH' | 'MID' | 'LOW'

interface ImageSlot {
  url: string | null
  strength: Strength
  label: string
}

function leoHeaders(apiKey: string) {
  return {
    accept: 'application/json',
    'content-type': 'application/json',
    authorization: `Bearer ${apiKey}`,
  }
}

// ─── Upload satu gambar ke Leonardo V1 ───────────────────────────────────────
async function uploadOneImage(sourceUrl: string, apiKey: string): Promise<string | null> {
  try {
    const initRes = await fetch(`${LEO_V1}/init-image`, {
      method: 'POST',
      headers: leoHeaders(apiKey),
      body: JSON.stringify({ extension: 'jpg' }),
    })
    if (!initRes.ok) return null

    const initData = await initRes.json()
    const uploadInfo = initData?.uploadInitImage
    if (!uploadInfo?.id || !uploadInfo?.url) return null

    const imageId = uploadInfo.id as string
    const uploadUrl = uploadInfo.url as string
    const fields: Record<string, string> = JSON.parse(uploadInfo.fields)

    const imgRes = await fetch(sourceUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    if (!imgRes.ok) return null
    const imgBuffer = await imgRes.arrayBuffer()

    const formData = new FormData()
    Object.entries(fields).forEach(([k, v]) => formData.append(k, v))
    formData.append('file', new Blob([imgBuffer], { type: 'image/jpeg' }))

    const s3Res = await fetch(uploadUrl, { method: 'POST', body: formData })
    if (!s3Res.ok && s3Res.status !== 204) return null

    return imageId
  } catch {
    return null
  }
}

// Upload semua slot paralel
async function uploadAll(slots: ImageSlot[], apiKey: string): Promise<(string | null)[]> {
  return Promise.all(slots.map(s => s.url ? uploadOneImage(s.url, apiKey) : Promise.resolve(null)))
}

// ─── Generate image via Leonardo V2 (GraphQL over HTTP) ──────────────────────
async function generateImage(
  prompt: string,
  apiKey: string,
  imageIds: (string | null)[],
  strengths: Strength[]
): Promise<string> {
  const validRefs = imageIds
    .map((id, i) => id ? { image: { id, type: 'UPLOADED' }, strength: strengths[i] } : null)
    .filter(Boolean)

  const parameters: any = {
    width: IMG_WIDTH,
    height: IMG_HEIGHT,
    prompt,
    quantity: 1,
    style_ids: [STYLE_ID],
    prompt_enhance: 'OFF',
  }
  if (validRefs.length > 0) {
    parameters.guidances = { image_reference: validRefs }
  }

  const payload = { model: LEONARDO_MODEL, parameters, public: false }

  console.log('\n━━━ [generate-image] IMAGE PROMPT ━━━')
  console.log(prompt)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  const res = await fetch(`${LEO_V2}/generations`, {
    method: 'POST',
    headers: leoHeaders(apiKey),
    body: JSON.stringify(payload),
  })

  const rawText = await res.text()
  const data = JSON.parse(rawText)

  // Leonardo V2 returns GraphQL errors as array with HTTP 200
  if (Array.isArray(data)) {
    const msg = data[0]?.extensions?.details?.errors?.[0]?.message
      || data[0]?.message
      || 'Leonardo GraphQL error'
    throw new Error(msg)
  }

  if (!res.ok) {
    throw new Error(data?.error || data?.message || `Leonardo error ${res.status}`)
  }

  const generationId = data?.generate?.generationId
  if (!generationId) throw new Error('generationId tidak ditemukan di response Leonardo')

  return String(generationId)
}

// ─── Poll sampai COMPLETE ─────────────────────────────────────────────────────
async function pollUntilComplete(
  generationId: string,
  apiKey: string,
  maxAttempts = 25,
  intervalMs = 4000
): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, intervalMs))
    const res = await fetch(`${LEO_V1}/generations/${generationId}`, {
      headers: leoHeaders(apiKey),
    })
    if (!res.ok) continue

    const data = await res.json()
    const gen = data?.generations_by_pk
    if (!gen) continue

    if (gen.status === 'COMPLETE') {
      const url = gen.generated_images?.[0]?.url
      if (!url) throw new Error('Generation COMPLETE tapi URL gambar kosong')
      return url
    }
    if (gen.status === 'FAILED') throw new Error('Leonardo generation FAILED')
  }
  throw new Error('Polling timeout — coba lagi')
}

// ─── POST Handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const {
      product,
      productAnalysis,
      creative,
      selectedHook,
      needCharacter,
      modelId,       // string — id dari MODEL_PRESETS
      backgroundId,  // string | null — id dari BACKGROUND_PRESETS, opsional
      customPrompt,
      leonardoApiKey,
    } = await req.json()

    if (!leonardoApiKey) {
      return NextResponse.json({ success: false, error: 'Leonardo API key diperlukan' }, { status: 400 })
    }

    // ── Resolve URL dari preset Supabase ──────────────────────────────────────
    const modelPreset = modelId ? getModelById(modelId) : null
    const bgPreset = backgroundId ? getBackgroundById(backgroundId) : null

    const setting = productAnalysis?.ugc_angles?.[0] || creative?.content_style || 'everyday setting'
    const action = creative?.creative_concept?.slice(0, 100) || 'using the product naturally'
    const hook = selectedHook || `Coba ${product.name}`

    let slots: ImageSlot[]
    let prompt: string

    if (needCharacter && modelPreset) {
      // ── Jalur 4: Ada model ──────────────────────────────────────────────────
      slots = [
        { url: product.imageUrls?.[0] ?? null, strength: 'HIGH', label: 'product'    },
        { url: modelPreset.url,                strength: 'MID',  label: 'model'      },
        // Background HIGH agar Leonardo tidak mengubahnya
        { url: bgPreset?.url ?? null,          strength: 'HIGH', label: 'background' },
      ]
      prompt = customPrompt || getImagePromptWithModel(
        product.name, setting, action, hook, modelPreset.gender,
        !!bgPreset   // ← flag: ada bg referensi
      )
    } else {
      // ── Jalur 5: Produk only ────────────────────────────────────────────────
      slots = [
        { url: product.imageUrls?.[0] ?? null, strength: 'HIGH', label: 'product'    },
        { url: bgPreset?.url ?? null,          strength: 'HIGH', label: 'background' },
      ]
      prompt = customPrompt || getImagePromptProductOnly(
        product.name, setting, action, hook,
        !!bgPreset   // ← flag: ada bg referensi
      )
    }

    const imageIds = await uploadAll(slots, leonardoApiKey)
    const strengths = slots.map(s => s.strength)

    const generationId = await generateImage(prompt, leonardoApiKey, imageIds, strengths)
    const imageUrl = await pollUntilComplete(generationId, leonardoApiKey)

    console.log(`[generate-image] done → ${imageUrl}`)

    return NextResponse.json({
      success: true,
      data: {
        id: generationId,
        url: imageUrl,
        prompt,       // ← dikirim ke frontend untuk ditampilkan di dashboard
        modelId: modelPreset?.id || null,
        backgroundId: bgPreset?.id || null,
        createdAt: Date.now(),
      },
    })
  } catch (err: any) {
    console.error('[generate-image] error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}