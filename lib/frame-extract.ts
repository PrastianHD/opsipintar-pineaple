// lib/frame-extract.ts
// Client-side video frame extractor (runs main thread; OffscreenCanvas if supported).
// Returns base64 JPEG frames at evenly-spaced timestamps.

export interface ExtractOptions {
  numFrames?: number
  height?: number
  quality?: number
  signal?: AbortSignal
}

export async function extractVideoFrames(
  file: File,
  opts: ExtractOptions = {}
): Promise<string[]> {
  const { numFrames = 4, height = 480, quality = 0.6, signal } = opts

  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

  const url = URL.createObjectURL(file)

  try {
    const video = document.createElement('video')
    video.src = url
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'
    // Some browsers require this for canvas.toDataURL on loaded blob
    try { video.crossOrigin = 'anonymous' } catch {}

    await new Promise<void>((resolve, reject) => {
      const onLoad = () => { cleanup(); resolve() }
      const onErr = () => { cleanup(); reject(new Error('Video gagal dimuat')) }
      const onAbort = () => { cleanup(); reject(new DOMException('Aborted', 'AbortError')) }
      const cleanup = () => {
        video.removeEventListener('loadedmetadata', onLoad)
        video.removeEventListener('error', onErr)
        signal?.removeEventListener('abort', onAbort)
      }
      video.addEventListener('loadedmetadata', onLoad)
      video.addEventListener('error', onErr)
      signal?.addEventListener('abort', onAbort, { once: true })
    })

    if (!video.duration || !isFinite(video.duration)) {
      throw new Error('Durasi video tidak valid')
    }

    const interval = video.duration / (numFrames + 1)
    const scale = height / Math.max(video.videoHeight, 1)
    const w = Math.max(1, Math.round(video.videoWidth * scale))
    const h = Math.max(1, Math.round(video.videoHeight * scale))

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas context tidak tersedia')

    const frames: string[] = []
    for (let i = 1; i <= numFrames; i++) {
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
      await seek(video, interval * i, signal)
      ctx.drawImage(video, 0, 0, w, h)
      frames.push(canvas.toDataURL('image/jpeg', quality))
    }

    return frames
  } finally {
    URL.revokeObjectURL(url)
  }
}

function seek(video: HTMLVideoElement, time: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const onSeeked = () => { cleanup(); resolve() }
    const onErr = () => { cleanup(); reject(new Error('Seek gagal')) }
    const onAbort = () => { cleanup(); reject(new DOMException('Aborted', 'AbortError')) }
    const cleanup = () => {
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('error', onErr)
      signal?.removeEventListener('abort', onAbort)
    }
    video.addEventListener('seeked', onSeeked, { once: true })
    video.addEventListener('error', onErr, { once: true })
    signal?.addEventListener('abort', onAbort, { once: true })
    video.currentTime = Math.min(Math.max(time, 0), Math.max(0, video.duration - 0.01))
  })
}
