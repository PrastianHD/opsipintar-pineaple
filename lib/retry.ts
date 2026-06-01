// lib/retry.ts
// Retry helper with exponential backoff + abort support

export interface RetryOptions {
  attempts?: number
  baseMs?: number
  factor?: number
  maxMs?: number
  signal?: AbortSignal
  onRetry?: (err: unknown, attempt: number) => void
}

export class AbortError extends Error {
  constructor() {
    super('Aborted')
    this.name = 'AbortError'
  }
}

export async function withRetry<T>(
  fn: (signal?: AbortSignal) => Promise<T>,
  opts: RetryOptions = {}
): Promise<T> {
  const { attempts = 2, baseMs = 1000, factor = 2, maxMs = 8000, signal, onRetry } = opts

  let lastErr: unknown
  for (let i = 0; i <= attempts; i++) {
    if (signal?.aborted) throw new AbortError()
    try {
      return await fn(signal)
    } catch (err) {
      lastErr = err
      if (i === attempts) break
      if (signal?.aborted) throw new AbortError()
      onRetry?.(err, i + 1)
      const delay = Math.min(baseMs * Math.pow(factor, i), maxMs)
      await sleep(delay, signal)
    }
  }
  throw lastErr
}

export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new AbortError())
      return
    }
    const t = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    const onAbort = () => {
      clearTimeout(t)
      reject(new AbortError())
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}
