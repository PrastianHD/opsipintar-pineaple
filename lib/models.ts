// lib/models.ts
// Preset model & background dari Supabase Storage
// Ganti URL dengan URL asli dari Supabase bucket kamu

import type { ModelPreset, BackgroundPreset } from '@/lib/types'

// ─── MODEL PRESETS ────────────────────────────────────────────────────────────
// Upload foto ke Supabase bucket: ugc-models/
// Format URL: https://<project>.supabase.co/storage/v1/object/public/ugc-models/<filename>

export const MODEL_PRESETS: ModelPreset[] = [
  {
    id: 'female_casual',
    label: 'Wanita Casual',
    gender: 'female',
    url: 'https://umjuwfeocrfadrceqehu.supabase.co/storage/v1/object/public/Product/model-wanita-casual.jpeg',
    thumbnail: 'https://umjuwfeocrfadrceqehu.supabase.co/storage/v1/object/public/Product/model-wanita-casual.jpeg',
  },
  {
    id: 'female_hijab',
    label: 'Wanita Hijab',
    gender: 'female',
    url: 'https://umjuwfeocrfadrceqehu.supabase.co/storage/v1/object/public/Product/model-wanita.jpegg',
    thumbnail: 'https://umjuwfeocrfadrceqehu.supabase.co/storage/v1/object/public/Product/model-wanita.jpeg',
  },
  {
    id: 'male_casual',
    label: 'Pria Casual',
    gender: 'male',
    url: 'https://umjuwfeocrfadrceqehu.supabase.co/storage/v1/object/public/Product/pria-formal.jpeg',
    thumbnail: 'https://umjuwfeocrfadrceqehu.supabase.co/storage/v1/object/public/Product/pria-formal.jpeg',
  },
  {
    id: 'male_formal',
    label: 'Pria Formal',
    gender: 'male',
    url: 'https://umjuwfeocrfadrceqehu.supabase.co/storage/v1/object/public/Product/model-pria.jpeg',
    thumbnail: 'https://umjuwfeocrfadrceqehu.supabase.co/storage/v1/object/public/Product/model-pria.jpeg',
  },
]

// ─── BACKGROUND PRESETS ───────────────────────────────────────────────────────
// Upload foto ke Supabase bucket: ugc-backgrounds/
// Format URL: https://<project>.supabase.co/storage/v1/object/public/ugc-backgrounds/<filename>

export const BACKGROUND_PRESETS: BackgroundPreset[] = [
  {
    id: 'kitchen_bright',
    label: 'Dapur Cerah',
    url: 'https://umjuwfeocrfadrceqehu.supabase.co/storage/v1/object/public/Product/dapur.jpeg',
  },
  {
    id: 'bedroom_cozy',
    label: 'Kamar Tidur',
    url: 'https://umjuwfeocrfadrceqehu.supabase.co/storage/v1/object/public/Product/kamar.jpeg',
  },
  {
    id: 'outdoor_cafe',
    label: 'Kafe / Outdoor',
    url: 'https://umjuwfeocrfadrceqehu.supabase.co/storage/v1/object/public/Product/makeup.jpeg',
  },
  {
    id: 'studio_clean',
    label: 'Studio Putih',
    url: 'https://umjuwfeocrfadrceqehu.supabase.co/storage/v1/object/public/Product/studio.jpeg',
  },
  {
    id: 'desk_minimal',
    label: 'Meja Minimalis',
    url: 'https://umjuwfeocrfadrceqehu.supabase.co/storage/v1/object/public/Product/meja.jpeg',
  },
]

export function getModelById(id: string): ModelPreset | undefined {
  return MODEL_PRESETS.find(m => m.id === id)
}

export function getBackgroundById(id: string): BackgroundPreset | undefined {
  return BACKGROUND_PRESETS.find(b => b.id === id)
}