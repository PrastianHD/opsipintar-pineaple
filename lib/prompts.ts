// lib/prompts.ts — Pipeline 8 Step UGC (Optimized for Nano Banana & Veo3/I2V)
// S1 getProductAnalysisPrompt  → /api/analyze
// S2 getCreativeDirectorPrompt → /api/creative
// S3 getHookGeneratorPrompt    → /api/hooks
// S4 getImagePromptWithModel   → /api/generate-image (ada model)
// S5 getImagePromptProductOnly → /api/generate-image (produk only)
// S6 getSceneAnalyzerPrompt    → /api/scene-analyze
// S7 getVideoSceneBuilderPrompt→ /api/video-scene
// S8 getUGCScriptSystemPrompt  → /api/video-prompt (system)
//    getUGCScriptUserPrompt    → /api/video-prompt (user)

import type { ProductAnalysis, CreativeConcept, SceneAnalysis, VideoScenePlan } from '@/lib/types'

// ─── S1 PRODUCT ANALYSIS ─────────────────────────────────────────────────────
export function getProductAnalysisPrompt(
  productName: string,
  category: string,
  description: string,
  targetMarket: string,
  hasReferenceVideo = false
): string {
  const ref = hasReferenceVideo
    ? ' REF_VIDEO=true: mirror hook style & pacing from reference frames in ugc_angles.'
    : ''
  const desc = (description || 'none').slice(0, 180)
  return `Product: ${productName} | Cat: ${category} | Market: ${targetMarket || 'auto'} | Desc: ${desc}${ref}
Analyze image+info for viral UGC potential. JSON only:
{"product":"${productName}","category":"","visual_elements":["","",""],"target_market":"","strengths":["","",""],"weaknesses":[""],"ugc_angles":["","",""],"confidence":"high"}`
}

// ─── S2 CREATIVE DIRECTOR ────────────────────────────────────────────────────
export function getCreativeDirectorPrompt(a: ProductAnalysis): string {
  return `Product: ${a.product} | Cat: ${a.category} | Market: ${a.target_market}
Strengths: ${a.strengths.slice(0, 3).join('; ')} | Angles: ${a.ugc_angles.slice(0, 3).join('; ')}
Create a highly engaging, viral UGC ad concept for TikTok/Reels. JSON only:
{"creative_concept":"","audience_persona":"","content_style":"","emotion_trigger":"","platform":"TikTok/Reels","content_goal":""}`
}

// ─── S3 HOOK GENERATOR ───────────────────────────────────────────────────────
export function getHookGeneratorPrompt(a: ProductAnalysis, c: CreativeConcept): string {
  return `${a.product} | ${c.emotion_trigger} | ${a.ugc_angles.slice(0, 2).join(', ')}
Generate 5 viral hooks (≤10 words each) using highly engaging, trending internet slang (bahasa Indonesia gaul). Make it punchy, curiosity-inducing, and stop the scroll. No boring claims.
{"hooks":["","","","",""]}`
}

// ─── NEGATIVE SHARED (Optimized for Nano Banana) ─────────────────────────────
// Dipangkas drastis agar token tidak terbuang sia-sia dan fokus pada error utama
const NEG = 'deformed, blurry, watermark, text'

// ─── S4 IMAGE PROMPT: MODEL + PRODUCT ────────────────────────────────────────
export function getImagePromptWithModel(
  productName: string,
  setting: string,
  action: string,
  hook: string,
  gender: 'female' | 'male' = 'female',
  hasBg = false
): string {
  const h    = (hook || `Try ${productName}`).slice(0, 50)
  const p    = productName.slice(0, 70)
  const s    = setting.slice(0, 90)
  const subj = gender === 'male'
    ? '1boy, young man, 24yo, handsome, natural smile, warm skin'
    : '1girl, young woman, 22yo, beautiful, natural smile, warm skin'
  const bgNote = hasBg
    ? 'Background exactly matches reference image.'
    : `Background: ${s}.`

  return `iPhone 15 selfie, UGC style, ${subj}, holding ${p}. ${bgNote} Soft natural lighting, authentic, photorealistic, depth of field. Overlay text "${h}". Negative: ${NEG}`
}

// ─── S5 IMAGE PROMPT: PRODUCT ONLY ───────────────────────────────────────────
export function getImagePromptProductOnly(
  productName: string,
  setting: string,
  _action: string,
  hook: string,
  hasBg = false
): string {
  const h = (hook || 'Top choice').slice(0, 60)
  const p = productName.slice(0, 80)
  const s = setting.slice(0, 100)
  
  const backgroundLogic = hasBg
    ? 'Exact same background as reference.'
    : `Setting: ${s}, cinematic bokeh.`

  return `Commercial product photography, ${p} centered. ${backgroundLogic} Studio lighting, 8k resolution, photorealistic, highly detailed. Overlay text "${h}". No humans. Negative: ${NEG}`
}

// ─── S6 SCENE ANALYZER ───────────────────────────────────────────────────────
export function getSceneAnalyzerPrompt(productName: string, hasCharacter: boolean): string {
  const motion = hasCharacter
    ? 'creator moves: e.g. subtle head nod, pointing at product, dynamic expression'
    : 'camera moves: e.g. cinematic pan, slow zoom, macro tracking — NO person'
  const charVal = hasCharacter ? 'describe creator accurately' : 'no characters — product only'

  return `Analyze image for Video-to-Video/Image-to-Video generation. Mode: ${hasCharacter ? 'creator+product' : 'product-only'}. Product: ${productName}.
JSON only:
{"scene_description":"","characters":"${charVal}","product_action":"","environment":"","lighting":"","camera":"","motion_ideas":["${motion}","",""]}`
}

// ─── S7 VIDEO SCENE BUILDER ───────────────────────────────────────────────────
export function getVideoSceneBuilderPrompt(
  productName: string,
  scene: SceneAnalysis,
  creative: CreativeConcept,
  hook: string,
  hasCharacter: boolean
): string {
  const type   = hasCharacter ? 'creator UGC' : 'product b-roll'
  const c1     = hasCharacter ? 'hook delivery + product intro' : 'cinematic product reveal'
  const c2     = hasCharacter ? 'product usage + CTA' : 'macro detail shot + dynamic light'
  const audio  = hasCharacter ? 'voiceover + trending audio' : 'lo-fi aesthetic beat'

  return `${productName} | ${type} | Hook: "${hook}" | Style: ${creative.content_style}
Scene: ${scene.scene_description.slice(0, 80)} | Motion: ${scene.motion_ideas.join(' / ')}
Clip1: ${c1}. Clip2: ${c2}. Audio: ${audio}.${hasCharacter ? '' : ' NO humans.'}
Plan the video for an AI video generator (like Veo3). Ensure spatial consistency. JSON only:
{"scene":"","actions":["",""],"camera":"","lighting":"","audio":"","final_shot":""}`
}

// ─── S8 UGC SCRIPT — SYSTEM PROMPT ───────────────────────────────────────────
export function getUGCScriptSystemPrompt(hasCharacter: boolean): string {
  const modeSpecific = hasCharacter 
    ? 'You are writing for a human creator UGC video. Maintain consistent facial features, clothing, and background across clips.'
    : 'You are writing for a product-only cinematic video. No humans allowed. Focus on camera motion, lighting shifts, and product textures.'

  return `You are an expert AI Video Prompt Engineer for Veo 3 / Universal Image-to-Video models.
Your task is to generate a complete JSON response for a 2-clip video sequence. ${modeSpecific}

CRITICAL: You MUST output a JSON object with this exact structure, matching the API expectations:
{
  "hook": "Spoken hook or text overlay",
  "problem": "Problem being addressed",
  "solution": "How the product solves it",
  "product_demo": "Brief description of the demo",
  "cta": "Call to action",
  "clip1": {
    "prompt": "Highly detailed visual prompt for Video AI (e.g. 'Cinematic tracking shot, young woman smiling...'). Include Veo3 parameters seamlessly if needed.",
    "endFrame": "Describe the exact visual state at the end of Clip 1 to ensure seamless transition.",
    "notes": "Director/motion notes for Clip 1"
  },
  "clip2": {
    "prompt": "Highly detailed visual prompt for Video AI continuing perfectly from Clip 1's endFrame.",
    "notes": "Director/motion notes for Clip 2"
  },
  "fullScene": "Overall visual and aesthetic description of the video"
}

Rules:
- Language: Video Prompts (clip1.prompt, clip2.prompt, endFrame) MUST be in English for the AI model.
- Script/Dialogue (hook, problem, solution, cta): Use Indonesian (bahasa gaul / casual).
- Camera/Motion: Specify exact camera movements (e.g., pan right, slow zoom, macro shot).
- Consistency: Ensure clip 2 logically and visually follows clip 1.
- No markdown outside of the JSON block.`
}

// ─── S8 UGC SCRIPT — USER PROMPT ─────────────────────────────────────────────
function s(v: string | undefined | null, len: number, fallback = ''): string {
  return (v ?? fallback).slice(0, len)
}

export function getUGCScriptUserPrompt(
  productName: string,
  scene: SceneAnalysis,
  videoScene: VideoScenePlan,
  creative: CreativeConcept,
  analysis: ProductAnalysis,
  hook: string
): string {
  const pts     = (analysis.strengths ?? []).slice(0, 3).join(', ')
  const creator = scene.characters !== 'no characters — product only'
    ? s(scene.characters, 80)
    : 'none'

  return `Product: ${productName}
Hook: "${hook}"
Creator: ${creator}
Scene: ${s(scene.scene_description, 100)}
Environment: ${s(scene.environment, 80)}
C1 action: ${(videoScene.actions ?? [])[0] || ''}
C2 action: ${(videoScene.actions ?? [])[1] || ''}
Camera: ${s(videoScene.camera, 60)}
Selling points: ${pts}
Goal: ${creative.content_goal ?? ''}

Generate the JSON following the exact schema provided in the system prompt. Optimize clip prompts for Veo3/Image-to-Video.`
}