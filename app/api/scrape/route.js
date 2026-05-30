import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { url, userAgent } = await request.json()
    if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

    let target
    try { target = new URL(url.startsWith('http') ? url : 'https://' + url) }
    catch { return NextResponse.json({ error: 'Invalid URL' }, { status: 400 }) }

    const t0 = Date.now()
    let html = '', pageSize = 0

    try {
      const r = await fetch(target.href, {
        headers: {
          'User-Agent': userAgent || 'Mozilla/5.0 Chrome/120',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Cache-Control': 'no-cache',
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(12000)
      })
      html = await r.text()
      pageSize = Math.round(Buffer.byteLength(html, 'utf8') / 1024)
    } catch (e) {
      return NextResponse.json({ error: 'Site fetch failed: ' + e.message })
    }

    const loadTime = Date.now() - t0

    // Meta extractor
    const meta = (name) =>
      html.match(new RegExp(`<meta[^>]*(?:name|property)=["']${name}["'][^>]*content=["']([^"']{0,500})["']`, 'i'))?.[1] ||
      html.match(new RegExp(`<meta[^>]*content=["']([^"']{0,500})["'][^>]*(?:name|property)=["']${name}["']`, 'i'))?.[1] || null

    const tag = (t) => html.match(new RegExp(`<${t}[^>]*>([^<]{1,200})<\/${t}>`, 'i'))?.[1]?.trim() || null

    // Data extraction
    const title = tag('title') || meta('og:title')
    const description = meta('description') || meta('og:description')
    const keywords = meta('keywords')
    const canonical = html.match(/rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1] || null
    const ogTitle = meta('og:title')
    const ogImage = meta('og:image')
    const ogDesc = meta('og:description')

    // Headers
    const headersRaw = [...html.matchAll(/<(h[1-6])[^>]*>([^<]{1,150})<\/h[1-6]>/gi)]
    const headers = headersRaw.slice(0, 15).map(m => ({ tag: m[1].toUpperCase(), text: m[2].trim() }))

    // Links
    const allLinks = [...html.matchAll(/href=["']([^"'#\s]{4,500})["']/gi)].map(m => m[1])
    const internal = allLinks.filter(l => l.startsWith('/') || l.includes(target.hostname)).length
    const external = allLinks.filter(l => l.startsWith('http') && !l.includes(target.hostname)).length

    // Images
    const imgs = [...html.matchAll(/<img[^>]*>/gi)]
    const missingAlt = imgs.filter(m => !m[0].includes('alt=')).length

    // Scripts & CSS
    const scripts = (html.match(/<script/gi) || []).length
    const stylesheets = (html.match(/rel=["']stylesheet["']/gi) || []).length

    // Viewport
    const viewport = /name=["']viewport["']/i.test(html)

    // Word count
    const textOnly = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    const wordCount = textOnly.split(' ').filter(w => w.length > 2).length

    // robots / sitemap check
    let hasRobots = false, hasSitemap = false
    try { hasRobots = (await fetch(`${target.origin}/robots.txt`, { signal: AbortSignal.timeout(4000) })).ok } catch {}
    try { hasSitemap = (await fetch(`${target.origin}/sitemap.xml`, { signal: AbortSignal.timeout(4000) })).ok } catch {}

    // SEO Scoring
    let score = 0
    const recs = []

    const check = (cond, pts, msg) => { if (cond) score += pts; else recs.push(msg) }

    check(!!title, 12, 'Title tag add karo')
    check(title && title.length >= 30 && title.length <= 60, 5, 'Title 30-60 characters ka hona chahiye')
    check(!!description, 12, 'Meta description add karo')
    check(description && description.length >= 120 && description.length <= 160, 5, 'Description 120-160 characters ka hona chahiye')
    check(!!keywords, 4, 'Meta keywords add karo')
    check(!!canonical, 5, 'Canonical URL set karo')
    check(headers.some(h => h.tag === 'H1'), 10, 'H1 tag add karo — page ka main heading')
    check(headers.length >= 3, 5, 'Zyada heading tags use karo (H2, H3)')
    check(hasRobots, 8, 'robots.txt file banao')
    check(hasSitemap, 8, 'sitemap.xml banao aur Google ko submit karo')
    check(target.protocol === 'https:', 10, 'HTTPS pe migrate karo')
    check(viewport, 6, 'Viewport meta tag add karo mobile ke liye')
    check(loadTime < 3000, 5, 'Page load speed improve karo')
    check(missingAlt === 0, 5, `${missingAlt} images mein alt text missing hai`)
    check(ogTitle || ogImage, 3, 'Open Graph meta tags add karo social sharing ke liye')
    check(wordCount >= 300, 3, 'Page pe zyada content likhein (300+ words)')

    const performance = Math.max(10, Math.min(100, Math.round(100 - loadTime / 80)))
    const security = target.protocol === 'https:' ? (hasRobots ? 88 : 72) : 32
    const mobile = viewport ? (loadTime < 3000 ? 90 : 70) : 40

    return NextResponse.json({
      url: target.href,
      seoScore: Math.min(100, score),
      performance,
      security,
      mobile,
      meta: { title, description, keywords, canonical, ogTitle, ogImage, ogDesc },
      headers,
      links: { internal, external },
      images: { total: imgs.length, missingAlt },
      technical: { https: target.protocol === 'https:', robots: hasRobots, sitemap: hasSitemap, viewport, loadTime, pageSize, scripts, stylesheets, wordCount },
      recommendations: recs,
      scannedAt: new Date().toISOString()
    })

  } catch (e) {
    return NextResponse.json({ error: 'Internal error: ' + e.message }, { status: 500 })
  }
                                                                          }
