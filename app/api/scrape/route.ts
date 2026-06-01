// app/api/scrape/route.ts
// Shopee scraper — prioritas: Shopee API → HTML (og:square_image → og:image)

import { NextRequest, NextResponse } from 'next/server'
import type { ScrapedProduct } from '@/lib/types'

const ALLOWED_HOSTS = new Set([
  'shopee.co.id',
  'shopee.com',
  'shopee.sg',
  'shopee.com.my',
  'shopee.ph',
  'shopee.vn',
  'shopee.co.th',
  'shopee.tw',
  'shopee.com.br',
])

const ALLOWED_IMG_HOSTS = [
  'susercontent.com',
  'shopee.co.id',
  'shopee.com',
  'shopee.sg',
  'shopee.com.my',
  'shopee.ph',
  'shopee.vn',
  'shopee.co.th',
  'shopee.tw',
  'shopee.com.br',
  'cf.shopee.co.id',
  'cf.shopee.sg',
  'cf.shopee.com.my',
  'cf.shopee.ph',
  'cf.shopee.vn',
  'cf.shopee.co.th',
  'cf.shopee.tw',
  'cf.shopee.com.br',
]

function isSafeImageUrl(u: string): boolean {
  try {
    const parsed = new URL(u)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false
    const host = parsed.hostname.toLowerCase()
    return ALLOWED_IMG_HOSTS.some((h) => host === h || host.endsWith('.' + h))
  } catch {
    return false
  }
}

function cleanProductName(rawName: string): string {
  if (!rawName) return 'Produk Shopee'
  const cleaned = rawName.split('|')[0].replace(/^Jual\s+/i, '').trim()
  return cleaned || 'Produk Shopee'
}

// In-memory LRU-ish cache, 5 min TTL. Survives within single server instance.
const CACHE_TTL_MS = 5 * 60 * 1000
const CACHE_MAX = 100
const scrapeCache = new Map<string, { at: number; data: ScrapedProduct }>()

function cacheGet(key: string): ScrapedProduct | null {
  const entry = scrapeCache.get(key)
  if (!entry) return null
  if (Date.now() - entry.at > CACHE_TTL_MS) {
    scrapeCache.delete(key)
    return null
  }
  return entry.data
}

function cacheSet(key: string, data: ScrapedProduct): void {
  if (scrapeCache.size >= CACHE_MAX) {
    const firstKey = scrapeCache.keys().next().value
    if (firstKey) scrapeCache.delete(firstKey)
  }
  scrapeCache.set(key, { at: Date.now(), data })
}

function normalizeShopeeUrl(input: string): URL | null {
  let raw = input.trim()
  if (!/^https?:\/\//i.test(raw)) raw = 'https://' + raw
  try {
    const u = new URL(raw)
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null
    const host = u.hostname.toLowerCase()
    const ok = [...ALLOWED_HOSTS].some(h => host === h || host.endsWith('.' + h))
    return ok ? u : null
  } catch {
    return null
  }
}

function extractShopeeIds(url: string): { shopId: string; itemId: string } | null {
  const patterns = [
    /product\/(\d+)\/(\d+)/,
    /-i\.(\d+)\.(\d+)/,
    /\/(\d+)\/(\d+)(?:\?|$)/,
  ]
  for (const pat of patterns) {
    const m = url.match(pat)
    if (m) return { shopId: m[1], itemId: m[2] }
  }
  return null
}

async function scrapeViaShopeeApi(origin: string, shopId: string, itemId: string): Promise<ScrapedProduct | null> {
  const apiUrl = `${origin}/api/v4/item/get?itemid=${itemId}&shopid=${shopId}`

  const res = await fetch(apiUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'X-Forwarded-For': '66.249.66.1',
      'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
    },
    next: { revalidate: 0 },
    signal: AbortSignal.timeout(8000),
  })

  if (!res.ok) return null
  const json = await res.json().catch(() => null)
  const item = json?.data
  if (!item) return null

  const images: string[] = []
  if (Array.isArray(item.images) && item.images.length) {
    item.images.slice(0, 5).forEach((hash: string) => {
      images.push(`https://down-id.img.susercontent.com/file/${hash}`)
    })
  } else if (item.image) {
    images.push(`https://down-id.img.susercontent.com/file/${item.image}`)
  }

  const cats: string[] = []
  const catSource = (Array.isArray(item.categories) && item.categories.length)
    ? item.categories
    : (Array.isArray(item.fe_categories) ? item.fe_categories : [])
  catSource.forEach((c: any) => cats.push(c?.display_name || c?.name || ''))

  let description = String(item.description || '')
  description = description.replace(/\n{3,}/g, '\n\n').replace(/[^\S\n]{2,}/g, ' ').slice(0, 800)

  return {
    name: cleanProductName(item.name),
    description,
    category: cats.filter(Boolean).join(' > ') || 'Lainnya',
    imageUrls: images,
    price: typeof item.price === 'number' ? `Rp ${(item.price / 100000).toLocaleString('id-ID')}` : undefined,
    rating: item.item_rating?.rating_star?.toFixed?.(1),
    shopName: item.shop_name || undefined,
    productLink: `${origin}/product/${shopId}/${itemId}`,
  }
}

async function scrapeViaHtml(url: string): Promise<ScrapedProduct | null> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'facebookexternalhit/1.1' },
    next: { revalidate: 0 },
    signal: AbortSignal.timeout(8000),
  })
  if (!res.ok) return null
  const html = await res.text()

  const squareImage = html.match(/<meta[^>]+property="og:square_image"[^>]+content="([^"]+)"/i)?.[1]
    || html.match(/<meta[^>]+name="og:square_image"[^>]+content="([^"]+)"/i)?.[1]

  const ogImage = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)?.[1]
    || html.match(/<meta[^>]+name="og:image"[^>]+content="([^"]+)"/i)?.[1]

  const primaryImage = squareImage || ogImage

  const ogTitle = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i)?.[1] || ''
  const ogDesc = html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]+)"/i)?.[1] || ''
  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || ''

  const decodeEntities = (s: string) =>
    s
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x?([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))

  const rawName = decodeEntities(ogTitle || title || '')
  if (!rawName) return null
  const name = cleanProductName(rawName)

  const images: string[] = []
  if (primaryImage) {
    const u = decodeEntities(primaryImage)
    if (isSafeImageUrl(u)) images.push(u)
  }
  if (ogImage && ogImage !== primaryImage) {
    const u = decodeEntities(ogImage)
    if (isSafeImageUrl(u)) images.push(u)
  }

  return {
    name,
    description: decodeEntities(ogDesc || ''),
    category: 'Lainnya',
    imageUrls: images,
    productLink: url,
  }
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ success: false, error: 'URL tidak valid' }, { status: 400 })
    }

    const parsed = normalizeShopeeUrl(url)
    if (!parsed) {
      return NextResponse.json(
        { success: false, error: 'URL bukan domain Shopee yang valid' },
        { status: 400 }
      )
    }

    const ids = extractShopeeIds(parsed.toString())
    const cacheKey = ids ? `${parsed.host}:${ids.shopId}:${ids.itemId}` : `url:${parsed.toString()}`
    const cached = cacheGet(cacheKey)
    if (cached) {
      return NextResponse.json({ success: true, data: cached, cached: true })
    }

    let product: ScrapedProduct | null = null

    if (ids) {
      product = await scrapeViaShopeeApi(parsed.origin, ids.shopId, ids.itemId)
    }
    if (!product) {
      product = await scrapeViaHtml(parsed.toString())
    }
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Gagal mengambil data produk. Pastikan link Shopee valid.' },
        { status: 422 }
      )
    }

    cacheSet(cacheKey, product)
    console.log(`[scrape] "${product.name}" — ${product.imageUrls.length} images`)
    return NextResponse.json({ success: true, data: product })
  } catch (err: any) {
    console.error('[scrape] error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
