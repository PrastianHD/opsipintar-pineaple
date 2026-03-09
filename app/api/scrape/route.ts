// app/api/scrape/route.ts
// Shopee scraper — prioritas: Shopee API → HTML (og:square_image → og:image)

import { NextRequest, NextResponse } from 'next/server'
import type { ScrapedProduct } from '@/lib/types'

// Helper function to clean the product title
function cleanProductName(rawName: string): string {
  if (!rawName) return 'Produk Shopee'
  
  // 1. Split at the pipe '|' and take the first chunk
  // 2. Remove "Jual " (case-insensitive) from the very beginning
  // 3. Trim extra whitespace
  const cleaned = rawName.split('|')[0].replace(/^Jual\s+/i, '').trim()
  
  return cleaned || 'Produk Shopee'
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

async function scrapeViaShopeeApi(shopId: string, itemId: string): Promise<ScrapedProduct | null> {
  const apiUrl = `https://shopee.co.id/api/v4/item/get?itemid=${itemId}&shopid=${shopId}`

  const res = await fetch(apiUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'X-Forwarded-For': '66.249.66.1',
      'Accept-Language': 'id-ID,id;q=0.9',
    },
    next: { revalidate: 0 },
  })

  if (!res.ok) return null
  const json = await res.json()
  const item = json?.data
  if (!item) return null

  const images: string[] = []
  if (item.images?.length) {
    item.images.slice(0, 5).forEach((hash: string) => {
      images.push(`https://down-id.img.susercontent.com/file/${hash}`)
    })
  } else if (item.image) {
    images.push(`https://down-id.img.susercontent.com/file/${item.image}`)
  }

  const cats: string[] = []
  if (item.categories?.length) {
    item.categories.forEach((c: any) => cats.push(c.display_name || c.name || ''))
  } else if (item.fe_categories?.length) {
    item.fe_categories.forEach((c: any) => cats.push(c.display_name || c.name || ''))
  }

  let description = item.description || ''
  description = description.replace(/\n{3,}/g, '\n\n').replace(/[^\S\n]{2,}/g, ' ').slice(0, 800)

  return {
    // Applied the cleaner function right here
    name: cleanProductName(item.name),
    description,
    category: cats.filter(Boolean).join(' > ') || 'Lainnya',
    imageUrls: images,
    price: item.price ? `Rp ${(item.price / 100000).toLocaleString('id-ID')}` : undefined,
    rating: item.item_rating?.rating_star?.toFixed(1),
    shopName: item.shop_name || undefined,
    productLink: `https://shopee.co.id/product/${shopId}/${itemId}`,
  }
}

async function scrapeViaHtml(url: string): Promise<ScrapedProduct | null> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'facebookexternalhit/1.1' },
    next: { revalidate: 0 },
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

  // Grab the raw title first, then run it through the cleaner
  const rawName = ogTitle || title || ''
  const name = cleanProductName(rawName)
  
  if (!name || name === 'Produk Shopee' && !rawName) return null

  const images: string[] = []
  if (primaryImage) images.push(primaryImage)
  if (ogImage && ogImage !== primaryImage) images.push(ogImage)

  return {
    name,
    description: ogDesc || '',
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

    let normalizedUrl = url.trim()
    if (!normalizedUrl.startsWith('http')) normalizedUrl = 'https://' + normalizedUrl

    const ids = extractShopeeIds(normalizedUrl)
    let product: ScrapedProduct | null = null

    if (ids) {
      product = await scrapeViaShopeeApi(ids.shopId, ids.itemId)
    }
    if (!product) {
      product = await scrapeViaHtml(normalizedUrl)
    }
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Gagal mengambil data produk. Pastikan link Shopee valid.' },
        { status: 422 }
      )
    }

    console.log(`[scrape] "${product.name}" — ${product.imageUrls.length} images`)
    return NextResponse.json({ success: true, data: product })
  } catch (err: any) {
    console.error('[scrape] error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}