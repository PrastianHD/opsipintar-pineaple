// lib/image-providers/openrouter.ts
// OpenRouter image generation via chat.completions with modalities: ['image']
// Supports: gemini-2.5-flash-image, gemini-3.1-flash-image-preview, gemini-3-pro-image-preview

import { createOpenRouterClient } from '@/lib/openrouter'
import { generateUUID } from '@/lib/utils'

export interface OpenRouterImageRef {
  url: string
  label: string
}

export interface OpenRouterImageResult {
  id: string
  url: string  // data URL (base64) atau https URL tergantung response
}

const SUPPORTED_MODELS = new Set([
  'google/gemini-2.5-flash-image',
  'google/gemini-3.1-flash-image-preview',
  'google/gemini-3-pro-image-preview',
])

export async function generateViaOpenRouter(args: {
  model: string
  prompt: string
  apiKey: string
  refs: OpenRouterImageRef[]
  signal?: AbortSignal
}): Promise<OpenRouterImageResult> {
  const { model, prompt, apiKey, refs, signal } = args

  if (!SUPPORTED_MODELS.has(model)) {
    throw new Error(`Model ${model} bukan image-output model yang didukung`)
  }

  const client = createOpenRouterClient(apiKey)

  const userContent: any[] = [{ type: 'text', text: prompt }]
  for (const ref of refs) {
    if (ref.url) {
      userContent.push({
        type: 'image_url',
        image_url: { url: ref.url },
      })
    }
  }

  const completion = await client.chat.completions.create(
    {
      model,
      modalities: ['image', 'text'],
      messages: [{ role: 'user', content: userContent }],
    } as any,
    { signal }
  )

  const choice = completion.choices?.[0]
  const message = choice?.message as any

  // OpenRouter returns images in message.images[0].image_url.url (data URL)
  const imageData = message?.images?.[0]?.image_url?.url
    || message?.image_url?.url

  if (!imageData) {
    const finishReason = choice?.finish_reason
    const textFallback = message?.content
    throw new Error(
      `OpenRouter tidak mengembalikan gambar. finish_reason: ${finishReason}. ${
        textFallback ? `Response text: ${String(textFallback).slice(0, 200)}` : ''
      }`
    )
  }

  return {
    id: completion.id || generateUUID(),
    url: imageData,
  }
}
