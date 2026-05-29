// app/api/audit/route.js  OR  pages/api/audit.js (Next.js both versions)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  XYNTRA PRO — Deep Website Audit Engine v9.0
//  Covers: SEO · Performance · Technical · Content · Security
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { NextResponse } from 'next/server';

// ── Helpers ───────────────────────────────────────────────────
const strip  = (html) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const decode = (str)  => str.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#039;/g,"'").replace(/&nbsp;/g,' ');
const extract = (html, regex, group = 1) => { const m = html.match(regex); return m ? decode(m[group].trim()) : null; };
const extractAll = (html, regex) => { const m = []; let r; while ((r = regex.exec(html)) !== null) m.push(r); return m; };
const countMatches = (html, regex) => (html.match(regex) || []).length;
const byteSize = (str) => new Blob([str]).size;
const kbSize   = (str) => (byteSize(str) / 1024).toFixed(1);

// ── Score Grader ──────────────────────────────────────────────
function grade(score) {
  if (score >= 90) return { grade: 'A+', label: 'Excellent',     color: '🟢' };
  if (score >= 80) return { grade: 'A',  label: 'Great',         color: '🟢' };
  if (score >= 70) return { grade: 'B',  label: 'Good',          color: '🟡' };
  if (score >= 55) return { grade: 'C',  label: 'Needs Work',    color: '🟠' };
  if (score >= 40) return { grade: 'D',  label: 'Poor',          color: '🔴' };
  return               { grade: 'F',  label: 'Critical',     color: '🚨' };
}

// ── Main POST Handler ─────────────────────────────────────────
export async function POST(request) {
  try {
    const body   = await request.json();
    const target = (body.prompt || body.url || '').trim();

    if (!target) {
      return NextResponse.json({ result: '❌ URL missing. Please provide a valid website URL.' });
    }

    // Normalize URL
    const url = target.startsWith('http') ? target : `https://${target}`;
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    const isHttps = urlObj.protocol === 'https:';

    // ── Parallel Fetches ──────────────────────────────────────
    const startTime = Date.now();

    const [mainRes, robotsRes, sitemapRes] = await Promise.allSettled([
      fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Xyntra-Audit/9.0)' },
        next: { revalidate: 0 }
      }),
      fetch(`${urlObj.origin}/robots.txt`, { next: { revalidate: 0 } }).catch(() => null),
      fetch(`${urlObj.origin}/sitemap.xml`, { next: { revalidate: 0 } }).catch(() => null),
    ]);

    const loadTime  = Date.now() - startTime;

    if (mainRes.status === 'rejected') {
      return NextResponse.json({ result: `❌ FETCH FAILED: ${mainRes.reason?.message || 'Site unreachable.'}` });
    }

    const response  = mainRes.value;
    const html      = await response.text();
    const pageSize  = kbSize(html);
    const httpCode  = response.status;
    const robotsTxt = robotsRes.status === 'fulfilled' && robotsRes.value?.ok ? await robotsRes.value.text() : null;
    const sitemapOk = sitemapRes.status === 'fulfilled' && sitemapRes.value?.ok;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  1. BASIC META TAGS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const title       = extract(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
    const description = extract(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i)
                     || extract(html, /<meta[^>]+content=["']([^"']*)[^>]+name=["']description["']/i);
    const keywords    = extract(html, /<meta[^>]+name=["']keywords["'][^>]+content=["']([^"']*)/i);
    const canonical   = extract(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)/i);
    const robotsMeta  = extract(html, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)/i);
    const lang        = extract(html, /<html[^>]+lang=["']([^"']*)/i);
    const charset     = extract(html, /<meta[^>]+charset=["']([^"']*)/i);
    const viewport    = extract(html, /<meta[^>]+name=["']viewport["'][^>]+content=["']([^"']*)/i);
    const favicon     = extract(html, /<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]+href=["']([^"']*)/i);
    const author      = extract(html, /<meta[^>]+name=["']author["'][^>]+content=["']([^"']*)/i);

    const titleLen  = title?.length || 0;
    const descLen   = description?.length || 0;

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  2. OPEN GRAPH & SOCIAL META
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const ogTitle       = extract(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)/i);
    const ogDescription = extract(html, /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)/i);
    const ogImage       = extract(html, /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)/i);
    const ogType        = extract(html, /<meta[^>]+property=["']og:type["'][^>]+content=["']([^"']*)/i);
    const ogUrl         = extract(html, /<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']*)/i);
    const twitterCard   = extract(html, /<meta[^>]+name=["']twitter:card["'][^>]+content=["']([^"']*)/i);
    const twitterTitle  = extract(html, /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']*)/i);
    const twitterImg    = extract(html, /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']*)/i);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  3. HEADINGS (H1 → H6)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const headings = {};
    const headingTexts = {};
    for (let i = 1; i <= 6; i++) {
      const re = new RegExp(`<h${i}[^>]*>([\\s\\S]*?)<\\/h${i}>`, 'gi');
      const matches = extractAll(html, re);
      headings[`h${i}`] = matches.length;
      headingTexts[`h${i}`] = matches.slice(0, 3).map(m => strip(m[1]).substring(0, 80));
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  4. IMAGES — alt, src, lazy
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const allImgs       = extractAll(html, /<img[^>]*>/gi);
    const totalImages   = allImgs.length;
    const imgsWithAlt   = allImgs.filter(m => /alt=["'][^"']+["']/i.test(m[0])).length;
    const imgsWithoutAlt= totalImages - imgsWithAlt;
    const lazyImages    = allImgs.filter(m => /loading=["']lazy["']/i.test(m[0])).length;

    // Logo detection
    const hasLogo = /logo/i.test(html) && /<img[^>]*logo[^>]*>/i.test(html);
    const logoSrc = extract(html, /<img[^>]*logo[^>]*src=["']([^"']*)/i)
                 || extract(html, /<img[^>]*src=["']([^"']*logo[^"']*)/i);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  5. LINKS — Internal, External, Broken candidates
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const allLinks     = extractAll(html, /<a[^>]+href=["']([^"'#][^"']*?)["']/gi);
    const totalLinks   = allLinks.length;
    const internalLinks = allLinks.filter(m => {
      const href = m[1];
      return href.startsWith('/') || href.includes(domain);
    }).length;
    const externalLinks = allLinks.filter(m => {
      const href = m[1];
      return href.startsWith('http') && !href.includes(domain);
    }).length;
    const nofollowLinks = countMatches(html, /rel=["'][^"']*nofollow[^"']*["']/gi);
    const externalDomains = [...new Set(
      allLinks
        .filter(m => m[1].startsWith('http') && !m[1].includes(domain))
        .map(m => { try { return new URL(m[1]).hostname; } catch { return null; } })
        .filter(Boolean)
    )].slice(0, 10);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  6. CONTENT ANALYSIS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const textContent  = strip(html);
    const wordCount    = textContent.split(/\s+/).filter(w => w.length > 2).length;
    const readingTime  = Math.ceil(wordCount / 200);
    const paragraphs   = countMatches(html, /<p[^>]*>/gi);
    const hasSchemaOrg = /schema\.org|application\/ld\+json/i.test(html);
    const schemaTypes  = (html.match(/"@type"\s*:\s*"([^"]+)"/g) || [])
                          .map(s => s.match(/"@type"\s*:\s*"([^"]+)"/)?.[1])
                          .filter(Boolean);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  7. TECHNICAL SEO
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const hasRobotsTxt   = !!robotsTxt;
    const robotsBlocked  = robotsTxt ? /disallow:\s*\//i.test(robotsTxt) : false;
    const cssFiles       = countMatches(html, /<link[^>]+rel=["']stylesheet["']/gi);
    const jsFiles        = countMatches(html, /<script[^>]+src=["']/gi);
    const inlineScripts  = countMatches(html, /<script(?![^>]+src=)[^>]*>/gi);
    const hasMinifiedCss = /\.min\.css/i.test(html);
    const hasMinifiedJs  = /\.min\.js/i.test(html);
    const hasGzip        = response.headers.get('content-encoding') === 'gzip';
    const hasCacheHeader = !!response.headers.get('cache-control');
    const serverHeader   = response.headers.get('server') || 'Unknown';
    const contentType    = response.headers.get('content-type') || '';
    const hasAmp         = /<html[^>]+amp[^>]*>/i.test(html) || /rel=["']amphtml["']/i.test(html);
    const hasPwa         = /manifest\.json/i.test(html) || /service[\-_]?worker/i.test(html);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  8. SECURITY CHECKS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const xFrame      = response.headers.get('x-frame-options');
    const xssProtect  = response.headers.get('x-xss-protection');
    const csp         = response.headers.get('content-security-policy');
    const hsts        = response.headers.get('strict-transport-security');
    const xContent    = response.headers.get('x-content-type-options');

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  9. SCORE CALCULATION  (total: 100 pts)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    let seoScore  = 0;
    let perfScore = 0;
    let techScore = 0;
    let secScore  = 0;

    // SEO (40 pts)
    if (title && titleLen >= 30 && titleLen <= 60) seoScore += 10; else if (title) seoScore += 5;
    if (description && descLen >= 120 && descLen <= 160) seoScore += 10; else if (description) seoScore += 5;
    if (headings.h1 === 1) seoScore += 8; else if (headings.h1 > 0) seoScore += 4;
    if (headings.h2 > 0) seoScore += 4;
    if (canonical) seoScore += 4;
    if (hasSchemaOrg) seoScore += 4;

    // OG / Social (10 pts)
    let socialScore = 0;
    if (ogTitle) socialScore += 2;
    if (ogDescription) socialScore += 2;
    if (ogImage) socialScore += 3;
    if (twitterCard) socialScore += 3;

    // Performance (25 pts)
    if (loadTime < 800)       perfScore += 12; else if (loadTime < 1500) perfScore += 8; else if (loadTime < 2500) perfScore += 4;
    if (pageSize < 100)       perfScore += 6; else if (pageSize < 250) perfScore += 4; else if (pageSize < 500) perfScore += 2;
    if (lazyImages > 0)       perfScore += 3;
    if (hasGzip)              perfScore += 4;

    // Technical (15 pts)
    if (viewport)             techScore += 3;
    if (lang)                 techScore += 2;
    if (hasRobotsTxt && !robotsBlocked) techScore += 3;
    if (sitemapOk)            techScore += 3;
    if (charset)              techScore += 2;
    if (favicon)              techScore += 2;

    // Security (10 pts)
    if (isHttps)              secScore += 4;
    if (hsts)                 secScore += 2;
    if (xFrame)               secScore += 1;
    if (csp)                  secScore += 2;
    if (xContent)             secScore += 1;

    const totalScore  = seoScore + socialScore + perfScore + techScore + secScore;
    const g           = grade(totalScore);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  10. ISSUES — Critical, Warnings, Info
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const critical = [], warnings = [], info = [];

    // Critical
    if (!title)                    critical.push('Title tag missing — Major ranking loss');
    if (!description)              critical.push('Meta description missing — Low CTR in search results');
    if (headings.h1 === 0)         critical.push('No H1 tag found — Primary keyword signal missing');
    if (headings.h1 > 1)           critical.push(`Multiple H1 tags (${headings.h1}) — SEO structure broken`);
    if (!isHttps)                  critical.push('Site NOT on HTTPS — Security & ranking penalty');
    if (httpCode >= 400)           critical.push(`HTTP ${httpCode} error — Page not accessible`);
    if (robotsBlocked)             critical.push('robots.txt is blocking search engines (Disallow: /) — Site invisible to Google');
    if (wordCount < 300)           critical.push(`Very thin content (${wordCount} words) — Low-quality content penalty risk`);

    // Warnings
    if (titleLen > 60)             warnings.push(`Title too long (${titleLen} chars) — Will be cut in Google (max 60)`);
    if (titleLen < 30 && title)    warnings.push(`Title too short (${titleLen} chars) — Add more keywords (min 30)`);
    if (descLen > 160)             warnings.push(`Meta description too long (${descLen} chars) — Truncated in SERPs (max 160)`);
    if (descLen < 120 && description) warnings.push(`Meta description too short (${descLen} chars) — Expand it (min 120)`);
    if (!canonical)                warnings.push('Canonical tag missing — Duplicate content risk');
    if (!ogImage)                  warnings.push('No OG image — Social shares look plain/broken');
    if (imgsWithoutAlt > 0)        warnings.push(`${imgsWithoutAlt} images missing alt text — Accessibility & SEO penalty`);
    if (!hasRobotsTxt)             warnings.push('robots.txt not found — Add it for better crawl control');
    if (!sitemapOk)                warnings.push('sitemap.xml not found — Crawler discovery reduced');
    if (loadTime > 2000)           warnings.push(`Slow load time: ${loadTime}ms — Google penalizes slow pages (target <1500ms)`);
    if (!hasSchemaOrg)             warnings.push('No Schema.org structured data — Missing rich results opportunity');
    if (!lang)                     warnings.push('HTML lang attribute missing — Accessibility & international SEO issue');
    if (jsFiles > 10)              warnings.push(`${jsFiles} JS files loaded — Too many resources, consider bundling`);
    if (pageSize > 300)            warnings.push(`Large page size (${pageSize}KB) — Consider compression & optimization`);
    if (!viewport)                 warnings.push('No viewport meta tag — Mobile display broken (Google uses mobile-first index)');

    // Info / Opportunities
    if (!keywords)                 info.push('No meta keywords tag (ignored by Google, but some engines use it)');
    if (!author)                   info.push('No author meta tag — Consider adding for E-E-A-T signals');
    if (!twitterCard)              info.push('No Twitter Card meta — Twitter previews will be plain');
    if (!hasCacheHeader)           info.push('No cache-control header — Add caching for faster repeat visits');
    if (!hsts)                     info.push('HSTS header missing — Add for enhanced HTTPS security');
    if (!csp)                      info.push('Content Security Policy header missing — Consider adding');
    if (inlineScripts > 5)         info.push(`${inlineScripts} inline scripts detected — Move to external files for better caching`);
    if (externalLinks === 0)       info.push('No external links found — Consider linking to authority sources');
    if (!hasLogo)                  info.push('Logo image not detected — Ensure logo has "logo" in src/class');
    if (!hasAmp)                   info.push('AMP not implemented — Consider for news/blog pages');

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    //  11. BUILD REPORT STRING
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const bar = (score, max, color = '█') => {
      const filled = Math.round((score / max) * 20);
      return color.repeat(filled) + '░'.repeat(20 - filled) + ` ${score}/${max}`;
    };

    const report = `
☢️  XYNTRA PRO — DEEP WEBSITE AUDIT REPORT v9.0
${'═'.repeat(58)}
🌐  DOMAIN     : ${domain}
🔗  FULL URL   : ${url}
📅  SCANNED    : ${new Date().toUTCString()}
🖥️  HTTP CODE  : ${httpCode} ${httpCode === 200 ? '✅' : '⚠️'}
🔒  PROTOCOL   : ${isHttps ? 'HTTPS ✅ Secure' : 'HTTP ❌ Not Secure'}
⚡  LOAD TIME  : ${loadTime}ms ${loadTime < 1000 ? '✅ Fast' : loadTime < 2000 ? '🟡 Moderate' : '🔴 Slow'}
📦  PAGE SIZE  : ${pageSize} KB
🖥️  SERVER     : ${serverHeader}

${'═'.repeat(58)}
📊  OVERALL SCORE: ${totalScore}/100 — Grade: ${g.grade} (${g.label}) ${g.color}
${'═'.repeat(58)}
  SEO Score      : [${bar(seoScore, 40)}]
  Social Score   : [${bar(socialScore, 10)}]
  Performance    : [${bar(perfScore, 25)}]
  Technical      : [${bar(techScore, 15)}]
  Security       : [${bar(secScore, 10)}]

${'─'.repeat(58)}
🏷️  META TAGS
${'─'.repeat(58)}
  Title         : ${title ? `"${title.substring(0,60)}${title.length>60?'…':''}"` : '❌ MISSING'}
  Title Length  : ${titleLen} chars ${titleLen>=30&&titleLen<=60?'✅ Perfect':titleLen>60?'⚠️ Too Long':'⚠️ Too Short'}

  Description   : ${description ? `"${description.substring(0,100)}${description.length>100?'…':''}"` : '❌ MISSING'}
  Desc Length   : ${descLen} chars ${descLen>=120&&descLen<=160?'✅ Perfect':descLen>160?'⚠️ Too Long':descLen>0?'⚠️ Too Short':''}

  Keywords      : ${keywords ? `"${keywords.substring(0,80)}"` : '— Not set'}
  Canonical URL : ${canonical || '❌ Missing'}
  Robots Meta   : ${robotsMeta || '— Not set (defaults to index,follow)'}
  Lang Attribute: ${lang || '❌ Missing'}
  Charset       : ${charset || '— Not detected'}
  Viewport      : ${viewport ? '✅ ' + viewport : '❌ MISSING (mobile broken)'}
  Author        : ${author || '— Not set'}
  Favicon       : ${favicon ? '✅ Found' : '⚠️ Not detected'}

${'─'.repeat(58)}
📱  OPEN GRAPH & SOCIAL META
${'─'.repeat(58)}
  OG Title      : ${ogTitle ? '✅ ' + ogTitle.substring(0,60) : '❌ Missing'}
  OG Description: ${ogDescription ? '✅ Set' : '❌ Missing'}
  OG Image      : ${ogImage ? '✅ ' + ogImage.substring(0,60) : '❌ Missing (social shares broken)'}
  OG Type       : ${ogType || '— Not set'}
  OG URL        : ${ogUrl ? '✅ Set' : '— Not set'}
  Twitter Card  : ${twitterCard ? '✅ ' + twitterCard : '❌ Missing'}
  Twitter Title : ${twitterTitle ? '✅ Set' : '— Not set'}
  Twitter Image : ${twitterImg ? '✅ Set' : '— Not set'}

${'─'.repeat(58)}
📝  HEADING STRUCTURE
${'─'.repeat(58)}
  H1 (${headings.h1}) ${headings.h1===1?'✅':headings.h1===0?'❌ MISSING':'⚠️ MULTIPLE'} | H2 (${headings.h2}) | H3 (${headings.h3}) | H4 (${headings.h4}) | H5 (${headings.h5}) | H6 (${headings.h6})
${headingTexts.h1.length>0 ? `
  H1 Tags Found:
${headingTexts.h1.map(t=>`    » "${t}"`).join('\n')}` : ''}${headingTexts.h2.length>0 ? `
  H2 Sample:
${headingTexts.h2.map(t=>`    » "${t}"`).join('\n')}` : ''}

${'─'.repeat(58)}
🖼️  IMAGES & MEDIA
${'─'.repeat(58)}
  Total Images  : ${totalImages}
  With Alt Text : ${imgsWithAlt} ${imgsWithAlt===totalImages?'✅ All good':'⚠️'}
  Missing Alt   : ${imgsWithoutAlt} ${imgsWithoutAlt>0?'❌ Fix for SEO':'✅'}
  Lazy Loading  : ${lazyImages} images ${lazyImages>0?'✅':'⚠️ Add loading="lazy"'}
  Logo Detected : ${hasLogo ? '✅ Yes' + (logoSrc ? ` (${logoSrc.substring(0,50)})` : '') : '⚠️ Not detected'}

${'─'.repeat(58)}
🔗  LINKS & BACKLINK PROFILE
${'─'.repeat(58)}
  Total Links   : ${totalLinks}
  Internal Links: ${internalLinks} (within ${domain})
  External Links: ${externalLinks} (to other domains)
  Nofollow Links: ${nofollowLinks}
${externalDomains.length>0 ? `  Linking To    :\n${externalDomains.map(d=>`    » ${d}`).join('\n')}` : ''}

${'─'.repeat(58)}
📄  CONTENT ANALYSIS
${'─'.repeat(58)}
  Word Count    : ${wordCount} words ${wordCount>=600?'✅ Good':wordCount>=300?'⚠️ Could be more':'❌ Too thin'}
  Reading Time  : ~${readingTime} min
  Paragraphs    : ${paragraphs}
  Structured Data: ${hasSchemaOrg ? '✅ Schema.org found' : '❌ No Schema markup'}
${schemaTypes.length>0 ? `  Schema Types  : ${schemaTypes.join(', ')}` : ''}

${'─'.repeat(58)}
⚙️  TECHNICAL SEO
${'─'.repeat(58)}
  Sitemap XML   : ${sitemapOk ? '✅ Found' : '❌ Missing (add /sitemap.xml)'}
  Robots.txt    : ${hasRobotsTxt ? (robotsBlocked?'❌ Blocking crawlers!':'✅ Found & configured') : '❌ Not found'}
  CSS Files     : ${cssFiles} ${hasMinifiedCss?'(minified ✅)':''}
  JS Files      : ${jsFiles} ${hasMinifiedJs?'(minified ✅)':jsFiles>8?'⚠️ Too many':''}
  Inline Scripts: ${inlineScripts} ${inlineScripts>5?'⚠️ Move to external files':'✅'}
  GZip          : ${hasGzip ? '✅ Enabled' : '⚠️ Not detected (enable for 60-80% size reduction)'}
  Cache Headers : ${hasCacheHeader ? '✅ Set' : '⚠️ Missing'}
  AMP           : ${hasAmp ? '✅ Implemented' : '— Not used'}
  PWA           : ${hasPwa ? '✅ Detected' : '— Not implemented'}

${'─'.repeat(58)}
🔐  SECURITY HEADERS
${'─'.repeat(58)}
  HTTPS/SSL     : ${isHttps ? '✅ Secure' : '❌ CRITICAL — Move to HTTPS immediately'}
  HSTS          : ${hsts ? '✅ ' + hsts.substring(0,50) : '❌ Missing'}
  X-Frame-Options: ${xFrame ? '✅ ' + xFrame : '⚠️ Missing (Clickjacking risk)'}
  XSS Protection: ${xssProtect ? '✅ ' + xssProtect : '⚠️ Missing'}
  Content-Sec-Pol: ${csp ? '✅ Set' : '⚠️ Missing'}
  X-Content-Type: ${xContent ? '✅ ' + xContent : '⚠️ Missing'}

${'═'.repeat(58)}
🚨  CRITICAL ISSUES (${critical.length}) — Fix Immediately
${'═'.repeat(58)}
${critical.length > 0
  ? critical.map((b,i) => `  ${i+1}. ❌ ${b}`).join('\n')
  : '  ✅ No critical issues found! Great work.'}

${'─'.repeat(58)}
⚠️  WARNINGS (${warnings.length}) — Fix Soon
${'─'.repeat(58)}
${warnings.length > 0
  ? warnings.map((b,i) => `  ${i+1}. ⚠️  ${b}`).join('\n')
  : '  ✅ No warnings.'}

${'─'.repeat(58)}
💡  OPPORTUNITIES (${info.length}) — Consider for Better Score
${'─'.repeat(58)}
${info.length > 0
  ? info.map((b,i) => `  ${i+1}. 💡 ${b}`).join('\n')
  : '  ✅ All opportunities addressed!'}

${'═'.repeat(58)}
📈  ACTION PLAN — Priority Order
${'═'.repeat(58)}
${[...critical.map(c=>'🔴 URGENT: '+c), ...warnings.slice(0,5).map(w=>'🟡 SOON: '+w), ...info.slice(0,3).map(i=>'🔵 LATER: '+i)]
  .slice(0,10)
  .map((item,i)=>`  ${i+1}. ${item}`)
  .join('\n') || '  ✅ Site is well-optimized!'}

${'═'.repeat(58)}
  Powered by XYNTRA PRO Audit Engine v9.0
  Report generated in ${Date.now() - startTime}ms
${'═'.repeat(58)}
`.trim();

    return NextResponse.json({ 
      result: report,
      // Structured JSON also available for frontend use
      data: {
        url, domain, httpCode, isHttps, loadTime, pageSize,
        score: { total: totalScore, seo: seoScore, social: socialScore, performance: perfScore, technical: techScore, security: secScore },
        grade: g,
        meta: { title, description, keywords, canonical, lang, viewport, favicon, author },
        og: { ogTitle, ogDescription, ogImage, ogType, twitterCard },
        headings, headingTexts,
        images: { total: totalImages, withAlt: imgsWithAlt, missingAlt: imgsWithoutAlt, lazy: lazyImages, hasLogo },
        links: { total: totalLinks, internal: internalLinks, external: externalLinks, nofollow: nofollowLinks, externalDomains },
        content: { wordCount, readingTime, paragraphs, hasSchema: hasSchemaOrg, schemaTypes },
        technical: { sitemapOk, hasRobotsTxt, robotsBlocked, cssFiles, jsFiles, hasGzip, hasCacheHeader, hasAmp, hasPwa },
        security: { isHttps, hsts: !!hsts, xFrame: !!xFrame, csp: !!csp, xContent: !!xContent },
        issues: { critical, warnings, info }
      }
    });

  } catch (error) {
    console.error('[XYNTRA AUDIT ERROR]', error);
    return NextResponse.json({ 
      result: `❌ AUDIT FAILED: ${error.message}\n\nPossible reasons:\n• Site is offline or unreachable\n• CORS blocking the request\n• Invalid URL format\n• Network timeout\n\nTry again or check the URL.` 
    });
  }
                                                                                                                                                                }
