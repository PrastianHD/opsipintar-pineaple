// lib/prompts.ts — Pipeline 8 Step UGC (Optimized for Nano Banana & Veo3/I2V)
// S1 getProductAnalysisPrompt   → /api/analyze
// S2 getCreativeAndHooksPrompt  → /api/creative-hooks (combined)
// S4 getImagePromptWithModel    → /api/generate-image (ada model)
// S5 getImagePromptProductOnly  → /api/generate-image (produk only)
// S6 getSceneAnalyzerPrompt     → /api/scene-analyze
// S7 getVideoSceneBuilderPrompt → /api/video-scene
// S8 getUGCScriptSystemPrompt   → /api/video-prompt (system)
//    getUGCScriptUserPrompt     → /api/video-prompt (user)

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
Analyze image+info for viral UGC potential in Indonesian market.
Output target_market, strengths, weaknesses, ugc_angles in Bahasa Indonesia (gaul/casual).
JSON only:
{"product":"${productName}","category":"<spesifik>","visual_elements":["<bentuk>","<tekstur>","<warna_dominan>"],"target_market":"<demografi ID singkat>","strengths":["<USP1>","<USP2>","<USP3>"],"weaknesses":["<weakness>"],"ugc_angles":["<angle1>","<angle2>","<angle3>"],"confidence":"low|medium|high"}`
}

// ─── S2+S3 COMBINED: CREATIVE + HOOKS (1 call) ───────────────────────────────
export function getCreativeAndHooksPrompt(a: ProductAnalysis): string {
  return `Product: ${a.product} | Cat: ${a.category} | Market: ${a.target_market}
Strengths: ${a.strengths.slice(0, 3).join('; ')} | Angles: ${a.ugc_angles.slice(0, 3).join('; ')}

Output JSON dengan 2 bagian sekaligus:
1) creative: viral UGC ad concept untuk TikTok/Reels (semua field bahasa Indonesia)
2) hooks: 10 hooks (≤10 kata, bahasa Indonesia gaul/casual, punchy, scroll-stopping, no boring claims)
3) hooks_top5: pilih 5 hook terbaik dari array hooks (verbatim string), urut dari paling viral

JSON only:
{"creative":{"creative_concept":"<konsep>","audience_persona":"<persona>","content_style":"<style>","emotion_trigger":"<emosi>","platform":"TikTok/Reels","content_goal":"<goal>"},"hooks":["h1","h2","h3","h4","h5","h6","h7","h8","h9","h10"],"hooks_top5":["best1","best2","best3","best4","best5"]}`
}

// ─── S4 IMAGE PROMPT: MODEL + PRODUCT ────────────────────────────────────────
// Note: NO overlay text (Nano Banana mangles Indonesian text — render in client UI)
// Note: NO "Negative:" string (Leonardo V2 GraphQL doesn't parse it; counter-productive)
export function getImagePromptWithModel(
  productName: string,
  setting: string,
  _action: string,
  _hook: string,
  gender: 'female' | 'male' = 'female',
  hasBg = false
): string {
  const p    = productName.slice(0, 70)
  const s    = setting.slice(0, 90)
  const subj = gender === 'male'
    ? 'young Indonesian man, 24yo, handsome, natural smile, warm skin tone'
    : 'young Indonesian woman, 22yo, beautiful, natural smile, warm skin tone'
  const bgNote = hasBg
    ? 'Background exactly matches reference image.'
    : `Background: ${s}.`

  return `iPhone 15 selfie, UGC style, ${subj}, holding ${p}. ${bgNote} Soft natural daylight, authentic, photorealistic, shallow depth of field.`
}

// ─── S5 IMAGE PROMPT: PRODUCT ONLY ───────────────────────────────────────────
export function getImagePromptProductOnly(
  productName: string,
  setting: string,
  _action: string,
  _hook: string,
  hasBg = false
): string {
  const p = productName.slice(0, 80)
  const s = setting.slice(0, 100)

  const backgroundLogic = hasBg
    ? 'Exact same background as reference.'
    : `Setting: ${s}, cinematic bokeh.`

  return `Commercial product photography, ${p} centered. ${backgroundLogic} Studio lighting, photorealistic, highly detailed, no humans.`
}

// ─── S6 SCENE ANALYZER ───────────────────────────────────────────────────────
export function getSceneAnalyzerPrompt(productName: string, hasCharacter: boolean): string {
  const motion = hasCharacter
    ? '<creator action: e.g. subtle head nod, pointing at product>'
    : '<camera move: e.g. cinematic pan, slow zoom, macro tracking>'
  const charVal = hasCharacter ? '<describe creator accurately>' : 'no characters — product only'

  return `Analyze image for Image-to-Video generation. Mode: ${hasCharacter ? 'creator+product' : 'product-only'}. Product: ${productName}.
Output in English (technical video planning).
JSON only:
{"scene_description":"<full scene>","characters":"${charVal}","product_action":"<how product appears>","environment":"<setting>","lighting":"<lighting type>","camera":"<camera angle>","motion_ideas":["${motion}","<motion2>","<motion3>"]}`
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
  const audio  = hasCharacter ? 'voiceover Bahasa Indonesia + trending audio' : 'lo-fi aesthetic beat'

  return `${productName} | ${type} | Hook: "${hook}" | Style: ${creative.content_style}
Scene: ${scene.scene_description.slice(0, 80)} | Motion: ${scene.motion_ideas.join(' / ')}
Clip1: ${c1}. Clip2: ${c2}. Audio: ${audio}.${hasCharacter ? '' : ' NO humans.'}
Plan video for Veo3 image-to-video. Ensure spatial consistency. Output in English.
JSON only:
{"scene":"<unified scene>","actions":["<clip1 action>","<clip2 action>"],"camera":"<camera plan>","lighting":"<lighting plan>","audio":"<audio brief>","final_shot":"<closing shot>"}`
}

// ─── S8 UGC SCRIPT — SYSTEM PROMPT ───────────────────────────────────────────
export function getUGCScriptSystemPrompt(hasCharacter: boolean): string {
  const modeSpecific = hasCharacter
    ? 'You are writing for a human creator UGC video. Maintain consistent facial features, clothing, and background across clips.'
    : 'You are writing for a product-only cinematic video. No humans allowed. Focus on camera motion, lighting shifts, and product textures.'

  return `You are an expert AI Video Prompt Engineer for Veo 3 / Universal Image-to-Video models.
Your task is to generate a complete JSON response for a 2-clip video sequence. ${modeSpecific}

CRITICAL: Output a JSON object with this exact structure:
{
  "hook": "Spoken hook or text overlay (Bahasa Indonesia gaul)",
  "problem": "Problem being addressed (Bahasa Indonesia)",
  "solution": "How the product solves it (Bahasa Indonesia)",
  "product_demo": "Brief description of the demo (Bahasa Indonesia)",
  "cta": "Call to action (Bahasa Indonesia gaul)",
  "clip1": {
    "prompt": "English. Highly detailed visual prompt for Video AI (e.g. 'Cinematic tracking shot, young woman smiling...').",
    "endFrame": "English. Describe exact visual state at end of Clip 1 for seamless transition.",
    "notes": "Director/motion notes for Clip 1"
  },
  "clip2": {
    "prompt": "English. Highly detailed visual prompt continuing perfectly from Clip 1's endFrame.",
    "notes": "Director/motion notes for Clip 2"
  },
  "fullScene": "English. Overall visual and aesthetic description of the video"
}

Rules:
- Video Prompts (clip1.prompt, clip2.prompt, endFrame, fullScene) MUST be in English.
- Script/Dialogue (hook, problem, solution, product_demo, cta) MUST be in Bahasa Indonesia gaul/casual.
- Camera/Motion: Specify exact camera movements (e.g., pan right, slow zoom, macro shot).
- Consistency: Clip 2 logically and visually follows Clip 1's endFrame.
- No markdown outside the JSON block.`
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

Generate JSON following the exact schema in system prompt. Optimize clip prompts for Veo3/Image-to-Video.`
}
