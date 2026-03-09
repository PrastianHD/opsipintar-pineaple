// lib/types.ts
// Pipeline 8 step UGC — types lengkap

export type TaskStatus =
  | 'pending'
  | 'analyzing'
  | 'creative'
  | 'hooks'
  | 'generating'
  | 'scene_analyzing'
  | 'video_scene'
  | 'scripting'
  | 'finished'
  | 'error'

export type ScriptTemplate = 'problem_solution' | 'personal_story' | 'quick_demo'

// ─── SCRAPE ──────────────────────────────────────────────────────────────────
export interface ScrapedProduct {
  name: string
  description: string
  category: string
  imageUrls: string[]       // [0] = square/product image utama
  price?: string
  rating?: string
  shopName?: string
  productLink: string
}

// ─── STEP 1: PRODUCT ANALYSIS ────────────────────────────────────────────────
export interface ProductAnalysis {
  product: string
  category: string
  visual_elements: string[]
  target_market: string
  strengths: string[]
  weaknesses: string[]
  ugc_angles: string[]
  confidence: 'low' | 'medium' | 'high'
}

// ─── STEP 2: CREATIVE DIRECTOR ───────────────────────────────────────────────
export interface CreativeConcept {
  creative_concept: string
  audience_persona: string
  content_style: string
  emotion_trigger: string
  platform: string
  content_goal: string
}

// ─── STEP 3: HOOK GENERATOR ──────────────────────────────────────────────────
export interface HookOptions {
  hooks: string[]   // 5 hook options
}

// ─── STEP 4/5: IMAGE GENERATOR ───────────────────────────────────────────────
export type ModelGender = 'female' | 'male'

export interface ModelPreset {
  id: string
  label: string
  gender: ModelGender
  url: string         // URL dari Supabase storage
  thumbnail: string   // sama atau preview
}

export interface BackgroundPreset {
  id: string
  label: string
  url: string
}

// ─── STEP 6: SCENE ANALYZER ──────────────────────────────────────────────────
export interface SceneAnalysis {
  scene_description: string
  characters: string
  product_action: string
  environment: string
  lighting: string
  camera: string
  motion_ideas: string[]
}

// ─── STEP 7: VIDEO SCENE BUILDER ─────────────────────────────────────────────
export interface VideoScenePlan {
  scene: string
  actions: string[]
  camera: string
  lighting: string
  audio: string
  final_shot: string
}

// ─── STEP 8: UGC SCRIPT WRITER ───────────────────────────────────────────────
export interface UGCScript {
  hook: string
  problem: string
  solution: string
  product_demo: string
  cta: string
  // Full 2-clip Gemini prompt
  clip1: VideoClip
  clip2: VideoClip
  fullScene: string
}

// ─── IMAGE & CLIPS ───────────────────────────────────────────────────────────
export interface VideoClip {
  prompt: string
  endFrame?: string
  notes?: string
  duration?: string
}

export interface GeneratedImage {
  id: string
  url: string
  prompt: string           // image prompt yang dipakai (tampil di dashboard)
  modelId?: string         // preset model yang dipilih
  backgroundId?: string    // preset background yang dipilih
  sceneAnalysis?: SceneAnalysis
  videoScene?: VideoScenePlan
  script?: UGCScript
  clip1?: VideoClip
  clip2?: VideoClip
  fullScene?: string
  createdAt: number
}

// ─── TASK (PIPELINE PENUH) ───────────────────────────────────────────────────
export interface Task {
  id: string
  status: TaskStatus
  createdAt: number
  updatedAt: number
  input: {
    productLink?: string
    targetMarket?: string
    needCharacter?: boolean | null
    modelId?: string          // preset model id
    backgroundId?: string     // preset background id (opsional)
    selectedHookIdx?: number  // hook mana yang dipilih user
  }
  scraped?: ScrapedProduct
  // Step hasil masing-masing
  productAnalysis?: ProductAnalysis
  creative?: CreativeConcept
  hooks?: HookOptions
  selectedHook?: string
  generatedImages?: GeneratedImage[]
  error?: string
}

// ─── API RESPONSES ────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}