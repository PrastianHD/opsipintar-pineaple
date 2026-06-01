// lib/image-providers/leonardo.ts
// Leonardo Nano Banana V1/V2 image generation
// Multi-ref strength control: HIGH/MID/LOW per slot

import { withRetry, sleep } from '@/lib/retry'

const LEO_V1 = 'https://cloud.leonardo.ai/api/rest/v1'
const LEO_V2 = 'https://cloud.leonardo.ai/api/rest/v2'
const LEONARDO_MODEL = 'gemini-2.5-flash-image'
const IMG_WIDTH = 768
const IMG_HEIGHT = 1344
const STYLE_ID = '111dc692-d470-4eec-b791-3475abac4c46'

export type Strength = 'HIGH' | 'MID' | 'LOW'

export interface ImageSlot {
  url: string | null
  strength: Strength
  label: string
}

export interface LeonardoResult {
  id: string
  url: string
}

function leoHeaders(apiKey: string) {
  return {
    accept: 'application/json',
    'content-type': 'application/json',
    authorization: `Bearer ${apiKey}`,
  }
}

function inferImageMeta(url: string, contentType: string | null): { ext: 'jpg' | 'png' | 'webp'; mime: string } {
  const ct = (contentType || '').toLowerCase()
  if (ct.includes('png')) return { ext: 'png', mime: 'image/png' }
  if (ct.includes('webp')) return { ext: 'webp', mime: 'image/webp' }
  if (ct.includes('jpeg') || ct.includes('jpg')) return { ext: 'jpg', mime: 'image/jpeg' }
  const lower = url.toLowerCase().split('?')[0]
  if (lower.endsWith('.png')) return { ext: 'png', mime: 'image/png' }
  if (lower.endsWith('.webp')) return { ext: 'webp', mime: 'image/webp' }
  return { ext: 'jpg', mime: 'image/jpeg' }
}

async function uploadOneImage(sourceUrl: string, apiKey: string): Promise<string | null> {
  try {
    const imgRes = await fetch(sourceUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    if (!imgRes.ok) return null
    const meta = inferImageMeta(sourceUrl, imgRes.headers.get('content-type'))
    const imgBuffer = await imgRes.arrayBuffer()

    const initRes = await fetch(`${LEO_V1}/init-image`, {
      method: 'POST',
      headers: leoHeaders(apiKey),
      body: JSON.stringify({ extension: meta.ext }),
    })
    if (!initRes.ok) return null

    const initData = await initRes.json().catch(() => null)
    const uploadInfo = initData?.uploadInitImage
    if (!uploadInfo?.id || !uploadInfo?.url || !uploadInfo?.fields) return null

    const imageId = uploadInfo.id as string
    const uploadUrl = uploadInfo.url as string
    let fields: Record<string, string>
    try {
      fields = typeof uploadInfo.fields === 'string'
        ? JSON.parse(uploadInfo.fields)
        : uploadInfo.fields
    } catch {
      return null
    }

    const formData = new FormData()
    Object.entries(fields).forEach(([k, v]) => formData.append(k, v))
    formData.append('file', new Blob([imgBuffer], { type: meta.mime }))

    const s3Res = await fetch(uploadUrl, { method: 'POST', body: formData })
    if (!s3Res.ok && s3Res.status !== 204) return null

    return imageId
  } catch {
    return null
  }
}

async function uploadAll(slots: ImageSlot[], apiKey: string): Promise<(string | null)[]> {
  return Promise.all(slots.map(s => s.url ? uploadOneImage(s.url, apiKey) : Promise.resolve(null)))
}

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

  const res = await fetch(`${LEO_V2}/generations`, {
    method: 'POST',
    headers: leoHeaders(apiKey),
    body: JSON.stringify(payload),
  })

  const rawText = await res.text()
  let data: any
  try { data = JSON.parse(rawText) }
  catch { throw new Error(`Leonardo response bukan JSON valid (HTTP ${res.status})`) }

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
  if (!generationId) throw new Error('generationId tidak ditemukan')

  return String(generationId)
}

async function pollUntilComplete(
  generationId: string,
  apiKey: string,
  maxAttempts = 25,
  intervalMs = 4000,
  signal?: AbortSignal
): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    await sleep(intervalMs, signal)
    const res = await fetch(`${LEO_V1}/generations/${generationId}`, {
      headers: leoHeaders(apiKey),
      signal,
    })
    if (!res.ok) continue

    const data = await res.json().catch(() => null)
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

export async function generateViaLeonardo(args: {
  prompt: string
  apiKey: string
  slots: ImageSlot[]
  signal?: AbortSignal
}): Promise<LeonardoResult> {
  const { prompt, apiKey, slots, signal } = args
  const imageIds = await uploadAll(slots, apiKey)
  const strengths = slots.map(s => s.strength)

  const generationId = await withRetry(
    () => generateImage(prompt, apiKey, imageIds, strengths),
    { attempts: 1, baseMs: 2000, signal }
  )
  const url = await pollUntilComplete(generationId, apiKey, 25, 4000, signal)
  return { id: generationId, url }
}
