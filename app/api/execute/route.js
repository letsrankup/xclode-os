// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  FILE LOCATION: app/api/audit/route.js
//  XYNTRA PRO — Deep Website Audit Engine v9.0
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { NextResponse } from 'next/server';

// ── Helpers ────────────────────────────────────────────────────
const strip       = (html) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const decode      = (str)  => str
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&nbsp;/g, ' ');
const extract     = (html, regex) => { const m = html.match(regex); return m ? decode(m[1].trim()) : null; };
const extractAll  = (html, regex) => { const arr = []; let r; while ((r = regex.exec(html)) !== null) arr.push(r); return arr; };
const countMatch  = (html, regex) => (html.match(regex) || []).length;
const kbSize      = (str) => (new Blob([str]).size / 1024).toFixed(1);

// ── Grade helper ───────────────────────────────────────────────
function grade(score) {
  if (score >= 90) return { grade: 'A+', label: 'Excellent',  color: 'green' };
  if (score >= 80) return { grade: 'A',  label: 'Great',      color: 'green' };
  if (score >= 70) return { grade: 'B',  label: 'Good',       color: 'yellow' };
  if (score >= 55) return { grade: 'C',  label: 'Needs Work', color: 'orange' };
  if (score >= 40) return { grade: 'D',  label: 'Poor',       color: 'red' };
  return               { grade: 'F',  label: 'Critical',  color: 'red' };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  OPTIONS — CORS preflight support
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  POST — Main audit handler
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function POST(request) {
  try {
    // ── 1. Parse body ──────────────────────────────
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { result: 'Invalid JSON in request body.' },
        { status: 400 }
      );
    }

    const target = (body?.url || body?.prompt || '').trim();
    if (!target) {
      return NextResponse.json(
        { result: 'URL missing. Please provide a valid website URL.' },
        { status: 400 }
      );
    }

    // ── 2. Normalize URL ───────────────────────────
    let url, urlObj, domain, isHttps;
    try {
      url    = target.startsWith('http') ? target : `https://${target}`;
      urlObj = new URL(url);
      domain = urlObj.hostname;
      isHttps = urlObj.protocol === 'https:';
    } catch {
      return NextResponse.json(
        { result: `Invalid URL format: "${target}"` },
        { status: 400 }
      );
    }

    // ── 3. Fetch target site + robots + sitemap ────
    const startTime = Date.now();
    const fetchOpts = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; XyntraAudit/9.0; +https://xyntra.app)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: AbortSignal.timeout(15000), // 15s timeout
    };

    const [mainRes, robotsRes, sitemapRes] = await Promise.allSettled([
      fetch(url, fetchOpts),
      fetch(`${urlObj.origin}/robots.txt`, { ...fetchOpts, signal: AbortSignal.timeout(5000) }),
      fetch(`${urlObj.origin}/sitemap.xml`, { ...fetchOpts, signal: AbortSignal.timeout(5000) }),
    ]);

    const loadTime = Date.now() - startTime;

    // Main fetch failed?
    if (mainRes.status === 'rejected') {
      const reason = mainRes.reason?.message || 'Site unreachable';
      return NextResponse.json({
        result: `FETCH FAILED: ${reason}\n\nPossible reasons:\n• Site is offline\n• Invalid URL\n• Connection timeout (>15s)\n• Site blocked bots`,
      });
    }

    const response = mainRes.value;
    const html     = await response.text();
    const pageSize = kbSize(html);
    const httpCode = response.status;

    const robotsTxt = (robotsRes.status === 'fulfilled' && robotsRes.value?.ok)
      ? await robotsRes.value.text() : null;
    const sitemapOk = robotsRes.status === 'fulfilled' && sitemapRes.value?.ok;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  META TAGS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const title       = extract(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
    const description =
      extract(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i) ||
      extract(html, /<meta[^>]+content=["']([^"']*)[^>]+name=["']description["']/i);
    const keywords    =
      extract(html, /<meta[^>]+name=["']keywords["'][^>]+content=["']([^"']*)/i);
    const canonical   =
      extract(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)/i);
    const robotsMeta  =
      extract(html, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)/i);
    const lang        = extract(html, /<html[^>]+lang=["']([^"']*)/i);
    const charset     = extract(html, /<meta[^>]+charset=["']([^"']*)/i);
    const viewport    =
      extract(html, /<meta[^>]+name=["']viewport["'][^>]+content=["']([^"']*)/i);
    const favicon     =
      extract(html, /<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]+href=["']([^"']*)/i);
    const author      =
      extract(html, /<meta[^>]+name=["']author["'][^>]+content=["']([^"']*)/i);

    const titleLen = title?.length || 0;
    const descLen  = description?.length || 0;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  OPEN GRAPH & SOCIAL
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const ogTitle       = extract(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)/i);
    const ogDescription = extract(html, /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)/i);
    const ogImage       = extract(html, /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)/i);
    const ogType        = extract(html, /<meta[^>]+property=["']og:type["'][^>]+content=["']([^"']*)/i);
    const ogUrl         = extract(html, /<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']*)/i);
    const twitterCard   = extract(html, /<meta[^>]+name=["']twitter:card["'][^>]+content=["']([^"']*)/i);
    const twitterTitle  = extract(html, /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']*)/i);
    const twitterImg    = extract(html, /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']*)/i);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  HEADINGS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const headings     = {};
    const headingTexts = {};
    for (let i = 1; i <= 6; i++) {
      const re = new RegExp(`<h${i}[^>]*>([\\s\\S]*?)<\\/h${i}>`, 'gi');
      const matches = extractAll(html, re);
      headings[`h${i}`]     = matches.length;
      headingTexts[`h${i}`] = matches.slice(0, 3).map(m => strip(m[1]).substring(0, 80));
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  IMAGES
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const allImgs        = extractAll(html, /<img[^>]*>/gi);
    const totalImages    = allImgs.length;
    const imgsWithAlt    = allImgs.filter(m => /alt=["'][^"']+["']/i.test(m[0])).length;
    const imgsWithoutAlt = totalImages - imgsWithAlt;
    const lazyImages     = allImgs.filter(m => /loading=["']lazy["']/i.test(m[0])).length;
    const hasLogo        = /logo/i.test(html) && /<img[^>]*logo[^>]*>/i.test(html);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  LINKS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const allLinks      = extractAll(html, /<a[^>]+href=["']([^"'#][^"']*?)["']/gi);
    const totalLinks    = allLinks.length;
    const internalLinks = allLinks.filter(m =>
      m[1].startsWith('/') || m[1].includes(domain)
    ).length;
    const externalLinks = allLinks.filter(m =>
      m[1].startsWith('http') && !m[1].includes(domain)
    ).length;
    const nofollowLinks = countMatch(html, /rel=["'][^"']*nofollow[^"']*["']/gi);
    const externalDomains = [...new Set(
      allLinks
        .filter(m => m[1].startsWith('http') && !m[1].includes(domain))
        .map(m => { try { return new URL(m[1]).hostname; } catch { return null; } })
        .filter(Boolean)
    )].slice(0, 10);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  CONTENT
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const textContent  = strip(html);
    const wordCount    = textContent.split(/\s+/).filter(w => w.length > 2).length;
    const readingTime  = Math.ceil(wordCount / 200);
    const paragraphs   = countMatch(html, /<p[^>]*>/gi);
    const hasSchemaOrg = /schema\.org|application\/ld\+json/i.test(html);
    const schemaTypes  = (html.match(/"@type"\s*:\s*"([^"]+)"/g) || [])
      .map(s => s.match(/"@type"\s*:\s*"([^"]+)"/)?.[1])
      .filter(Boolean);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  TECHNICAL
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const hasRobotsTxt  = !!robotsTxt;
    const robotsBlocked = robotsTxt ? /disallow:\s*\//i.test(robotsTxt) : false;
    const cssFiles      = countMatch(html, /<link[^>]+rel=["']stylesheet["']/gi);
    const jsFiles       = countMatch(html, /<script[^>]+src=["']/gi);
    const inlineScripts = countMatch(html, /<script(?![^>]+src=)[^>]*>/gi);
    const hasMinifiedCss = /\.min\.css/i.test(html);
    const hasMinifiedJs  = /\.min\.js/i.test(html);
    const hasGzip        = response.headers.get('content-encoding') === 'gzip';
    const hasCacheHeader = !!response.headers.get('cache-control');
    const serverHeader   = response.headers.get('server') || 'Unknown';
    const hasAmp         = /<html[^>]+amp[^>]*>/i.test(html) || /rel=["']amphtml["']/i.test(html);
    const hasPwa         = /manifest\.json/i.test(html) || /service[\-_]?worker/i.test(html);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  SECURITY HEADERS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const xFrame     = response.headers.get('x-frame-options');
    const xssProtect = response.headers.get('x-xss-protection');
    const csp        = response.headers.get('content-security-policy');
    const hsts       = response.headers.get('strict-transport-security');
    const xContent   = response.headers.get('x-content-type-options');

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  SCORE CALCULATION  (total: 100 pts)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    let seoScore  = 0;
    let perfScore = 0;
    let techScore = 0;
    let secScore  = 0;
    let socialScore = 0;

    // SEO (40 pts)
    if (title && titleLen >= 30 && titleLen <= 60) seoScore += 10; else if (title) seoScore += 5;
    if (description && descLen >= 120 && descLen <= 160) seoScore += 10; else if (description) seoScore += 5;
    if (headings.h1 === 1) seoScore += 8; else if (headings.h1 > 0) seoScore += 4;
    if (headings.h2 > 0)   seoScore += 4;
    if (canonical)         seoScore += 4;
    if (hasSchemaOrg)      seoScore += 4;

    // Social (10 pts)
    if (ogTitle)       socialScore += 2;
    if (ogDescription) socialScore += 2;
    if (ogImage)       socialScore += 3;
    if (twitterCard)   socialScore += 3;

    // Performance (25 pts)
    if (loadTime < 800)  perfScore += 12;
    else if (loadTime < 1500) perfScore += 8;
    else if (loadTime < 2500) perfScore += 4;
    if (pageSize < 100)  perfScore += 6;
    else if (pageSize < 250) perfScore += 4;
    else if (pageSize < 500) perfScore += 2;
    if (lazyImages > 0)  perfScore += 3;
    if (hasGzip)         perfScore += 4;

    // Technical (15 pts)
    if (viewport)                             techScore += 3;
    if (lang)                                 techScore += 2;
    if (hasRobotsTxt && !robotsBlocked)       techScore += 3;
    if (sitemapOk)                            techScore += 3;
    if (charset)                              techScore += 2;
    if (favicon)                              techScore += 2;

    // Security (10 pts)
    if (isHttps)  secScore += 4;
    if (hsts)     secScore += 2;
    if (xFrame)   secScore += 1;
    if (csp)      secScore += 2;
    if (xContent) secScore += 1;

    const totalScore = seoScore + socialScore + perfScore + techScore + secScore;
    const g = grade(totalScore);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  ISSUES
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const critical = [];
    const warnings = [];
    const info     = [];

    // Critical
    if (!title)            critical.push('Title tag missing — Major ranking loss');
    if (!description)      critical.push('Meta description missing — Low CTR in search results');
    if (headings.h1 === 0) critical.push('No H1 tag found — Primary keyword signal missing');
    if (headings.h1 > 1)   critical.push(`Multiple H1 tags (${headings.h1}) — SEO structure broken`);
    if (!isHttps)          critical.push('Site NOT on HTTPS — Security & ranking penalty');
    if (httpCode >= 400)   critical.push(`HTTP ${httpCode} error — Page not accessible`);
    if (robotsBlocked)     critical.push('robots.txt blocking all crawlers (Disallow: /) — Site invisible to Google');
    if (wordCount < 300)   critical.push(`Very thin content (${wordCount} words) — Low-quality penalty risk`);

    // Warnings
    if (titleLen > 60)                  warnings.push(`Title too long (${titleLen} chars) — Truncated in Google (max 60)`);
    if (titleLen < 30 && title)         warnings.push(`Title too short (${titleLen} chars) — Add more keywords (min 30)`);
    if (descLen > 160)                  warnings.push(`Meta description too long (${descLen} chars) — Truncated in SERPs`);
    if (descLen < 120 && description)   warnings.push(`Meta description too short (${descLen} chars) — Expand it (min 120)`);
    if (!canonical)                     warnings.push('Canonical tag missing — Duplicate content risk');
    if (!ogImage)                       warnings.push('No OG image — Social shares look broken');
    if (imgsWithoutAlt > 0)             warnings.push(`${imgsWithoutAlt} images missing alt text — Accessibility & SEO penalty`);
    if (!hasRobotsTxt)                  warnings.push('robots.txt not found — Add for better crawl control');
    if (!sitemapOk)                     warnings.push('sitemap.xml not found — Crawler discovery reduced');
    if (loadTime > 2000)                warnings.push(`Slow load time: ${loadTime}ms — Target <1500ms`);
    if (!hasSchemaOrg)                  warnings.push('No Schema.org structured data — Missing rich results');
    if (!lang)                          warnings.push('HTML lang attribute missing — Accessibility & international SEO issue');
    if (jsFiles > 10)                   warnings.push(`${jsFiles} JS files — Too many, consider bundling`);
    if (pageSize > 300)                 warnings.push(`Large page size (${pageSize}KB) — Optimize & compress`);
    if (!viewport)                      warnings.push('No viewport meta — Mobile display broken (Google uses mobile-first)');

    // Info / Opportunities
    if (!keywords)        info.push('No meta keywords tag (ignored by Google, used by some engines)');
    if (!author)          info.push('No author meta tag — Consider for E-E-A-T signals');
    if (!twitterCard)     info.push('No Twitter Card — Twitter previews will be plain');
    if (!hasCacheHeader)  info.push('No cache-control header — Add for faster repeat visits');
    if (!hsts)            info.push('HSTS header missing — Add for enhanced HTTPS security');
    if (!csp)             info.push('Content Security Policy header missing');
    if (inlineScripts > 5) info.push(`${inlineScripts} inline scripts — Move to external files for better caching`);
    if (externalLinks === 0) info.push('No external links — Consider linking to authority sources');
    if (!hasLogo)         info.push('Logo image not detected');
    if (!hasAmp)          info.push('AMP not implemented — Consider for news/blog pages');

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  RETURN STRUCTURED RESPONSE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    return NextResponse.json(
      {
        data: {
          // Site info
          url,
          domain,
          httpCode,
          isHttps,
          loadTime,
          pageSize,
          server: serverHeader,
          scannedAt: new Date().toISOString(),

          // Scores
          score: {
            total:       totalScore,
            seo:         seoScore,
            social:      socialScore,
            performance: perfScore,
            technical:   techScore,
            security:    secScore,
          },
          grade: g,

          // Meta
          meta: {
            title,
            description,
            keywords,
            canonical,
            robotsMeta,
            lang,
            charset,
            viewport,
            favicon,
            author,
          },

          // Open Graph
          og: {
            ogTitle,
            ogDescription,
            ogImage,
            ogType,
            ogUrl,
            twitterCard,
            twitterTitle,
            twitterImg,
          },

          // Headings
          headings,
          headingTexts,

          // Images
          images: {
            total:       totalImages,
            withAlt:     imgsWithAlt,
            missingAlt:  imgsWithoutAlt,
            lazy:        lazyImages,
            hasLogo,
          },

          // Links
          links: {
            total:          totalLinks,
            internal:       internalLinks,
            external:       externalLinks,
            nofollow:       nofollowLinks,
            externalDomains,
          },

          // Content
          content: {
            wordCount,
            readingTime,
            paragraphs,
            hasSchema:   hasSchemaOrg,
            schemaTypes,
          },

          // Technical
          technical: {
            sitemapOk,
            hasRobotsTxt,
            robotsBlocked,
            cssFiles,
            jsFiles,
            inlineScripts,
            hasMinifiedCss,
            hasMinifiedJs,
            hasGzip,
            hasCacheHeader,
            hasAmp,
            hasPwa,
          },

          // Security
          security: {
            isHttps,
            hsts:     !!hsts,
            xFrame:   !!xFrame,
            xss:      !!xssProtect,
            csp:      !!csp,
            xContent: !!xContent,
          },

          // Issues
          issues: {
            critical,
            warnings,
            info,
          },
        },
      },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('[XYNTRA AUDIT ERROR]', error);
    return NextResponse.json(
      {
        result: `AUDIT FAILED: ${error.message}\n\nPossible reasons:\n• Site is offline or unreachable\n• Network timeout\n• Invalid URL format`,
      },
      { status: 500 }
    );
  }
      }
