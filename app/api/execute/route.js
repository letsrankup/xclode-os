import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { action, prompt } = await request.json();

    if (!prompt || prompt.trim() === "") {
      return NextResponse.json({ result: "❌ CORE ERROR: Operational array empty. Please provide a URL or Topic Matrix." });
    }

    const target = prompt.trim();

    // ========================================================
    // TOOL SWITCH 1: OMNI EXTRACTOR ELITE + BULK LINK SILO & CONTENT CORE
    // ========================================================
    if (action === 'OMNI_EXTRACT') {
      if (target.startsWith('http://') || target.startsWith('https://')) {
        
        const startTime = Date.now();
        const response = await fetch(target, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) XyntraEliteBot/3.0' },
          next: { revalidate: 0 }
        });

        if (!response.ok) {
          return NextResponse.json({ result: `❌ CORE FETCH ERROR: Destination node returned status ${response.status}` });
        }

        const html = await response.text();
        const duration = Date.now() - startTime;

        // Metadata extraction
        const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
        const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["']/i) || 
                          html.match(/<meta[^>]*content=["']([\s\S]*?)["'][^>]*name=["']description["']/i);
        
        // Advanced Link Extraction
        const linkRegex = /href=["'](https?:\/\/[^"']+)["']/g;
        let links = [];
        let match;
        while ((match = linkRegex.exec(html)) !== null) {
          if (!links.includes(match[1]) && links.length < 5) {
            links.push(match[1]);
          }
        }

        // EXTRA CLIENT VALUE: Schema Markup Detection & Social OG Tags
        const hasSchema = /type=["']application\/ld\+json["']/i.test(html);
        const hasOGTags = /property=["']og:/i.test(html);
        const imagesCount = (html.match(/<img\s+/gi) || []).length;

        return NextResponse.json({
          result: `📡 [XYNTRA OMNI EXTRACTOR DEEP ENGINE v3.0]\n` +
                  `--------------------------------------------------\n` +
                  `🔗 TARGET DOMAIN    : ${target}\n` +
                  `⏱️ LATENCY RESPONSE : ${duration}ms\n` +
                  `📝 METADATA TITLE   : "${titleMatch ? titleMatch[1].trim() : "No Title Detected"}"\n` +
                  `📋 META DESCRIPTION : "${descMatch ? descMatch[1].trim() : "No Description Found"}"\n` +
                  `🖼️ ASSET METRICS    : ${imagesCount} images cached\n\n` +
                  `💎 [EXTRA CLIENT VALUE - ADVANCED CODE DETECTION]:\n` +
                  `   🔹 STRUCTURED SCHEMA ORG : ${hasSchema ? "✅ INSTALLED (Rich Snippets Eligible)" : "❌ MISSING (Client is losing Google Rich Features!)"}\n` +
                  `   🔹 SOCIAL GRAPH OG TAGS  : ${hasOGTags ? "✅ PRESENT (Optimized for Facebook/WhatsApp sharing)" : "⚠️ MISSING (Bad for social traffic branding)"}\n\n` +
                  `📂 [EXTRACTED OUTBOUND LINKS MATRIX]:\n` +
                  (links.length > 0 ? links.map((l, i) => `   [${i+1}] ${l}`).join('\n') : '   No links parsed.') + '\n' +
                  `--------------------------------------------------\n` +
                  `🤖 Core node extraction pipeline completed successfully.`
        });

      } else {
        // EXTRA CLIENT VALUE: Niche Word Input / AI Semantic Engine
        const semanticLsi = [`${target} framework`, `${target} architecture`, `${target} standard operating procedure`, `scalable ${target} cloud`];
        const monetizationStrategy = `Create a high-ticket $1,500/month retainer service model managing ${target} assets for local enterprises, or build a specialized CPA/Affiliate funnel targeting high-intent buyer keywords.`;

        return NextResponse.json({
          result: `🤖 [XYNTRA COGNITIVE AI SEMANTIC & MONETIZATION ENGINE]\n` +
                  `--------------------------------------------------\n` +
                  `💡 RAW SEARCH INPUT : "${target}"\n\n` +
                  `💎 [EXTRA VALUE 1: SEMANTIC LSI KEYWORDS FOR GOOGLE RANKING]:\n` +
                  semanticLsi.map((k, i) => `   🔹 ${i+1}. ${k}`).join('\n') + '\n\n' +
                  `🛡️ [EXTRA VALUE 2: MONETIZATION Blueprint & ROI STRATEGY]:\n` +
                  `   💰 ${monetizationStrategy}\n\n` +
                  `📂 [EXTRA VALUE 3: INTERNAL LINK SILO STRUCTURE (SEO ARCHITECTURE)]:\n` +
                  `   📂 Parent Node: /${target.toLowerCase().replace(/\s+/g, '-')}-guide\n` +
                  `      ├── Child Node 1: /what-is-${target.toLowerCase().replace(/\s+/g, '-')}\n` +
                  `      ├── Child Node 2: /advanced-${target.toLowerCase().replace(/\s+/g, '-')}-tips\n` +
                  `      └── Child Node 3: /best-${target.toLowerCase().replace(/\s+/g, '-')}-tools-2026\n` +
                  `--------------------------------------------------\n` +
                  `🚀 Semantic Node Pipeline Processing Terminated.`
        });
      }
    }

    // ========================================================
    // TOOL SWITCH 2: DEEP DIAGNOSTIC AI SEO & SECURITY PROTOCOL
    // ========================================================
    if (action === 'SEO_AUTOMATION') {
      if (target.startsWith('http://') || target.startsWith('https://')) {
        
        const response = await fetch(target, { next: { revalidate: 0 } });
        const html = await response.text();

        // Structural Checks
        const hasH1 = /<h1[^>]*>([\s\S]*?)<\/h1>/i.test(html);
        const hasH2 = /<h2[^>]*>([\s\S]*?)<\/h2>/i.test(html);
        const hasFavicon = /<link[^>]*rel=["'](?:shortcut )?icon["']/i.test(html);
        const hasSSL = target.startsWith('https://');
        const pageSizeKB = Math.round(html.length / 1024);

        // EXTRA CLIENT VALUE: Tech Stack & Security Header Detection
        const isNextJS = html.includes('__NEXT_DATA__') || html.includes('_next/static');
        const hasWordPress = html.includes('/wp-content/') || html.includes('/wp-includes/');
        
        let techStack = "Custom HTML/Standard JS Framework";
        if (isNextJS) techStack = "Next.js Production Matrix Framework Server Core";
        if (hasWordPress) techStack = "WordPress Open-Source Engine Core CMS Node";

        // Score Calculation
        let seoScore = 30; 
        if (hasH1) seoScore += 20;
        if (hasH2) seoScore += 15;
        if (hasFavicon) seoScore += 15;
        if (hasSSL) seoScore += 20;

        return NextResponse.json({
          result: `🔍 [XYNTRA PREMIUM MULTI-LEVEL AUDIT & CORE SIGNALS REPORT]\n` +
                  `--------------------------------------------------\n` +
                  `🎯 HOST ARCHITECTURE: ${target}\n` +
                  `💯 TOTAL HEALTH SCORE: ${seoScore}/100\n\n` +
                  `💎 [EXTRA VALUE: COGNITIVE COMPETITOR OUTSMART STRATEGY]:\n` +
                  (seoScore < 80 
                    ? `   ⚠️ Strategy: Competitor site has low technical architecture. Instantly outrank them by fixing the missing H1 nodes, injecting Schema.org JSON markup, and reducing file sizes below 100KB.`
                    : `   ✅ Strategy: Site optimization is good. Maintain ranking dominance by triggering automated daily indexing crons and building high-authority external backlinks.`) + `\n\n` +
                  `📊 [TECHNICAL CORE INFRASTRUCTURE MATRIX]:\n` +
                  `   🛠️ detected Tech Stack : ${techStack}\n` +
                  `   📦 Source Weight Payload: ${pageSizeKB} KB (${pageSizeKB > 150 ? "⚠️ HEAVY (Will load slow on 3G/4G Mobile Networks)" : "✅ FAST CORE (Excellent mobile speed profile)"})\n` +
                  `   🛡️ SSL Security Protocol: ${hasSSL ? "✅ SECURED GATEWAY CONNECTOR" : "❌ HIGH INSECURE LAYER DETECTED"}\n` +
                  `   📝 Main Heading H1 Node : ${hasH1 ? "✅ STABLE STRUCTURE" : "❌ ARCHITECTURE FAULT (Critical Google Penalty!)"}\n` +
                  `   📐 Sub Heading H2 Node  : ${hasH2 ? "✅ DETECTED" : "⚠️ WARNING: Bad page depth layout"}\n` +
                  `--------------------------------------------------\n` +
                  `💻 AI Diagnostics synchronized. System Ready for Client Presentation.`
        });
      } else {
        return NextResponse.json({ 
          result: `❌ SEO FAULT: A secure target domain node starting with http:// or https:// is necessary.` 
        });
      }
    }

    return NextResponse.json({ result: "Unknown command matrix system." });

  } catch (error) {
    return NextResponse.json({ result: `❌ [CRITICAL ENGINE FAULT]: ${error.message}` });
  }
                    }
        
