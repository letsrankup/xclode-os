// src/app/api/scrape/route.js
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { url, userAgent } = body

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate URL
    let targetUrl
    try {
      targetUrl = new URL(url.startsWith('http') ? url : `https://${url}`)
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    const startTime = Date.now()

    // Fetch the website with user agent
    const fetchHeaders = {
      'User-Agent': userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
    }

    let html = ''
    let pageSize = 0
    let fetchError = null

    try {
      const response = await fetch(targetUrl.href, {
        headers: fetchHeaders,
        redirect: 'follow',
        signal: AbortSignal.timeout(10000)
      })
      html = await response.text()
      pageSize = Math.round(Buffer.byteLength(html, 'utf8') / 1024)
    } catch (e) {
      fetchError = e.message
    }

    const loadTime = Date.now() - startTime

    // Parse meta tags from HTML
    const getMeta = (name) => {
      const match = html.match(new RegExp(`<meta[^>]*(?:name|property)=["']${name}["'][^>]*content=["']([^"']*)["']`, 'i'))
        || html.match(new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*(?:name|property)=["']${name}["']`, 'i'))
      return match ? match[1] : null
    }

    const getTag = (tag) => {
      const match = html.match(new RegExp(`<${tag}[^>]*>([^<]*)<\/${tag}>`, 'i'))
      return match ? match[1].trim() : null
    }

    // Extract headers
    const headerMatches = [...html.matchAll(/<(h[1-6])[^>]*>([^<]*)<\/h[1-6]>/gi)]
    const headers = headerMatches.slice(0, 10).map(m => ({ tag: m[1].toUpperCase(), text: m[2].trim() }))

    // Count links
    const allLinks = [...html.matchAll(/href=["']([^"']+)["']/gi)].map(m => m[1])
    const internalLinks = allLinks.filter(l => l.startsWith('/') || l.includes(targetUrl.hostname))
    const externalLinks = allLinks.filter(l => l.startsWith('http') && !l.includes(targetUrl.hostname))

    // Check robots and sitemap
    let hasRobots = false
    let hasSitemap = false
    try {
      const robotsRes = await fetch(`${targetUrl.origin}/robots.txt`, { signal: AbortSignal.timeout(3000) })
      hasRobots = robotsRes.ok
    } catch {}
    try {
      const sitemapRes = await fetch(`${targetUrl.origin}/sitemap.xml`, { signal: AbortSignal.timeout(3000) })
      hasSitemap = sitemapRes.ok
    } catch {}

    // Extract title and meta
    const title = getTag('title') || getMeta('og:title')
    const description = getMeta('description') || getMeta('og:description')
    const keywords = getMeta('keywords')
    const canonical = html.match(/rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1]
      || html.match(/href=["']([^"']+)["'][^>]*rel=["']canonical["']/i)?.[1]

    // Calculate SEO Score
    let seoScore = 0
    const recommendations = []

    if (title) { seoScore += 15 } else { recommendations.push('Add a <title> tag to your page') }
    if (title && title.length >= 30 && title.length <= 60) { seoScore += 5 } else { recommendations.push('Title should be 30-60 characters') }
    if (description) { seoScore += 15 } else { recommendations.push('Add a meta description tag') }
    if (description && description.length >= 120 && description.length <= 160) { seoScore += 5 } else { recommendations.push('Meta description should be 120-160 characters') }
    if (headers.length > 0) { seoScore += 10 } else { recommendations.push('Add H1-H6 heading tags for structure') }
    if (headers.some(h => h.tag === 'H1')) { seoScore += 10 } else { recommendations.push('Add exactly one H1 tag') }
    if (canonical) { seoScore += 5 } else { recommendations.push('Add a canonical URL tag') }
    if (hasRobots) { seoScore += 10 } else { recommendations.push('Create a robots.txt file') }
    if (hasSitemap) { seoScore += 10 } else { recommendations.push('Create a sitemap.xml file') }
    if (targetUrl.protocol === 'https:') { seoScore += 10 } else { recommendations.push('Migrate to HTTPS') }
    if (loadTime < 3000) { seoScore += 5 } else { recommendations.push('Improve page load speed (currently slow)') }

    const performance = Math.min(100, Math.round(100 - (loadTime / 100)))
    const security = targetUrl.protocol === 'https:' ? (hasRobots ? 85 : 70) : 30
    const mobile = html.includes('viewport') ? 80 : 40

    return NextResponse.json({
      url: targetUrl.href,
      seoScore,
      performance,
      security,
      mobile,
      meta: { title, description, keywords, canonical },
      headers,
      links: {
        internal: internalLinks.length,
        external: externalLinks.length,
        broken: 0
      },
      technical: {
        https: targetUrl.protocol === 'https:',
        robots: hasRobots,
        sitemap: hasSitemap,
        loadTime,
        pageSize
      },
      recommendations,
      scannedAt: new Date().toISOString(),
      error: fetchError
    })

  } catch (e) {
    return NextResponse.json({ error: 'Internal server error: ' + e.message }, { status: 500 })
  }
        }
