import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// XYNTRA AGENCY OS — Professional SEO Intelligence Dashboard
// ============================================================

const CLAUDE_MODEL = "claude-sonnet-4-20250514";

// --- Color & Style Tokens ---
const C = {
  bg: "#04060f",
  panel: "#080c1a",
  border: "#0f2040",
  accent: "#00d4ff",
  accent2: "#7b2fff",
  green: "#00ff9d",
  red: "#ff3b5c",
  yellow: "#ffd700",
  text: "#b8c8e0",
  dim: "#3a4a6a",
};

// --- Utility ---
const uid = () => Math.random().toString(36).slice(2, 8).toUpperCase();
const ts = () => new Date().toLocaleTimeString("en-US", { hour12: false });

// --- PDF Export (pure JS, no library needed) ---
function buildPDF(reportData) {
  // We'll use the browser's print API to generate PDF from HTML
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>Xyntra Intelligence Report</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');
  *{margin:0;padding:0;box-sizing:border-box;}
  body{background:#fff;color:#111;font-family:'JetBrains Mono',monospace;font-size:11px;padding:40px;}
  .header{background:linear-gradient(135deg,#04060f,#0a0f2e);color:#00d4ff;padding:30px;margin-bottom:30px;border-radius:8px;}
  .header h1{font-family:'Syne',sans-serif;font-size:26px;letter-spacing:3px;margin-bottom:6px;}
  .header .meta{color:#7b2fff;font-size:10px;letter-spacing:2px;text-transform:uppercase;}
  .header .target{color:#b8c8e0;margin-top:10px;font-size:12px;}
  .section{margin-bottom:24px;border:1px solid #e0e0e0;border-radius:6px;overflow:hidden;}
  .section-title{background:#f5f7ff;padding:10px 16px;font-weight:700;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#0a0f2e;border-bottom:1px solid #e0e0e0;}
  .section-body{padding:16px;}
  .finding{display:flex;gap:12px;margin-bottom:10px;padding:8px 12px;background:#f9f9f9;border-radius:4px;border-left:3px solid #00d4ff;}
  .finding.warn{border-left-color:#ffd700;}
  .finding.crit{border-left-color:#ff3b5c;}
  .finding.good{border-left-color:#00ff9d;}
  .badge{display:inline-block;padding:2px 8px;border-radius:3px;font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;}
  .badge-info{background:#e0f4ff;color:#0070b8;}
  .badge-warn{background:#fff8e0;color:#b88000;}
  .badge-crit{background:#ffe0e5;color:#b8002a;}
  .badge-good{background:#e0fff2;color:#007840;}
  .raw-output{background:#04060f;color:#00d4ff;padding:16px;border-radius:4px;white-space:pre-wrap;font-size:10px;line-height:1.7;}
  .score-box{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;background:#04060f;border-radius:6px;color:#00ff9d;font-size:18px;font-weight:700;letter-spacing:2px;}
  .footer{margin-top:40px;padding-top:16px;border-top:1px solid #e0e0e0;color:#999;font-size:9px;display:flex;justify-content:space-between;}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
  .kv{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px dashed #eee;font-size:10px;}
  .kv-key{color:#666;}
  .kv-val{font-weight:700;color:#111;}
</style>
</head>
<body>
<div class="header">
  <div class="meta">// XYNTRA AGENCY OS — CLASSIFIED INTELLIGENCE REPORT //</div>
  <h1>DEEP SITE AUDIT</h1>
  <div class="target">TARGET: ${reportData.url} &nbsp;|&nbsp; SCAN ID: ${reportData.scanId} &nbsp;|&nbsp; ${reportData.date}</div>
</div>

${reportData.sections.map(s => `
<div class="section">
  <div class="section-title">${s.title}</div>
  <div class="section-body">
    <div class="raw-output">${s.content.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>
  </div>
</div>
`).join('')}

<div class="footer">
  <span>XYNTRA AGENCY OS // Operator: ${reportData.operator}</span>
  <span>Generated: ${reportData.date} // Node: Khuzdar_Alpha</span>
</div>
</body>
</html>`;

  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  setTimeout(() => { win.print(); }, 800);
}

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [view, setView] = useState("dashboard"); // dashboard | admin | history
  const [users] = useState([
    { id: 1, email: "admin@xyntra.io", role: "ADMIN", plan: "Enterprise", scans: 47, joined: "2024-01-15", active: true },
    { id: 2, email: "client1@agency.com", role: "OPERATOR", plan: "Pro", scans: 23, joined: "2024-03-01", active: true },
    { id: 3, email: "client2@startup.io", role: "OPERATOR", plan: "Starter", scans: 8, joined: "2024-05-10", active: false },
  ]);
  const [currentUser] = useState(users[0]);
  const [targetUrl, setTargetUrl] = useState("");
  const [logs, setLogs] = useState([
    { id: uid(), time: ts(), type: "SYSTEM", msg: "XYNTRA NODE INITIALIZED // Khuzdar_Alpha Online" },
    { id: uid(), time: ts(), type: "SYSTEM", msg: "All intelligence modules standing by." },
  ]);
  const [reports, setReports] = useState([]);
  const [activeReport, setActiveReport] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [activeModule, setActiveModule] = useState(null);
  const [stats, setStats] = useState({ totalScans: 78, reportsGen: 31, activeClients: 12, avgScore: 67 });
  const logsEndRef = useRef(null);

useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = useCallback((type, msg) => {
    setLogs(prev => [...prev, { id: uid(), time: ts(), type, msg }]);
  }, []);

  const runModule = useCallback(async (moduleId, moduleLabel, systemPrompt) => {
    if (!targetUrl.trim()) {
      addLog("WARNING", "No target URL provided. Operation aborted.");
      return;
    }
    setScanning(true);
    setActiveModule(moduleId);
    addLog("CMD", `Executing [${moduleLabel}] on → ${targetUrl}`);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: CLAUDE_MODEL,
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: "user", content: `Analyze this website: ${targetUrl}` }],
        }),
      });
      const data = await response.json();
      const result = data.content?.map(b => b.text || "").join("\n") || "No response received.";

      addLog("RESULT", `[${moduleLabel}] Analysis complete.`);

      const reportEntry = {
        id: uid(),
        scanId: `XYN-${uid()}`,
        url: targetUrl,
        module: moduleLabel,
        moduleId,
        content: result,
        date: new Date().toLocaleString(),
        operator: currentUser.email,
      };
      setReports(prev => [reportEntry, ...prev]);
      setActiveReport(reportEntry);
      setStats(s => ({ ...s, totalScans: s.totalScans + 1 }));
    } catch (err) {
      addLog("ERROR", `Module failed: ${err.message}`);
    } finally {
      setScanning(false);
      setActiveModule(null);
    }
  }, [targetUrl, currentUser.email, addLog]);

  // ---- MODULES CONFIG ----
  const modules = [
    {
      id: "SEO_AUDIT",
      label: "SEO Full Audit",
      category: "SEO",
      color: C.accent,
      icon: "◈",
      prompt: `You are a professional SEO auditor. Analyze the provided website URL and give a comprehensive SEO audit report. Cover:
1. Technical SEO issues (site speed, mobile-friendliness, crawlability, sitemaps, robots.txt)
2. On-page SEO (title tags, meta descriptions, heading structure, keyword usage, content quality)
3. Off-page signals (domain authority estimates, backlink profile quality)
4. Core Web Vitals assessment
5. Structured data / Schema markup presence
6. International SEO if applicable
For each area give a score out of 10, key findings, and specific actionable recommendations. Be professional and detailed. Format with clear sections.`,
    },
    {
      id: "TECH_STACK",
      label: "Tech Stack Detection",
      category: "Recon",
      color: C.green,
      icon: "⬡",
      prompt: `You are a web technology analyst. Based on the URL provided, identify and analyze the likely technology stack. Cover:
1. Frontend framework (React, Vue, Angular, vanilla JS, etc.)
2. CMS or page builder (WordPress, Webflow, Shopify, custom, etc.)
3. Hosting & CDN provider (Vercel, AWS, Cloudflare, etc.)
4. Analytics tools
5. Marketing stack (CRM, email tools, chat widgets)
6. Performance & security tools
7. Notable libraries or third-party integrations
Provide confidence levels for each detection and explain indicators that led to each conclusion.`,
    },
    {
      id: "CONTENT_ANALYSIS",
      label: "Content Intelligence",
      category: "Content",
      color: C.accent2,
      icon: "◉",
      prompt: `You are a content strategy expert. Analyze the website's content approach and provide:
1. Content quality assessment (depth, expertise, readability)
2. Topic coverage and content gaps vs industry standards
3. Blog/resource section analysis (frequency, quality, SEO alignment)
4. Brand voice and tone evaluation
5. Call-to-action effectiveness
6. Content freshness and update frequency signals
7. AI-generated vs human-written content indicators
8. Recommendations for content improvement and expansion
Be specific with examples and actionable next steps.`,
    },
    {
      id: "COMPETITOR_ANALYSIS",
      label: "Competitor Intelligence",
      category: "Strategy",
      color: C.yellow,
      icon: "⊕",
      prompt: `You are a competitive intelligence analyst. For this website, provide:
1. Identify likely top 3-5 competitors in the same niche
2. Estimate their relative market positioning
3. Key differentiators vs competitors
4. SWOT analysis of the target site
5. Keyword gaps and opportunities competitors are exploiting
6. Content and feature gaps vs competitors
7. Pricing and positioning signals
8. Strategic recommendations to gain competitive advantage
Base analysis on visible signals, industry knowledge, and best practices.`,
    },
    {
      id: "UX_AUDIT",
      label: "UX & CRO Audit",
      category: "UX",
      color: "#ff9f43",
      icon: "◎",
      prompt: `You are a UX and Conversion Rate Optimization (CRO) expert. Analyze this website for:
1. Above-the-fold impact and value proposition clarity
2. Navigation structure and information architecture
3. Call-to-action placement and copy effectiveness
4. Trust signals (testimonials, certifications, social proof)
5. Form design and lead capture optimization
6. Mobile UX assessment
7. Page load and performance impact on conversions
8. Accessibility considerations
9. Heatmap predictions - where users likely click/drop off
10. Top 5 CRO improvements with estimated impact
Provide a conversion readiness score and prioritized action list.`,
    },
    {
      id: "LOCAL_SEO",
      label: "Local SEO Analysis",
      category: "SEO",
      color: "#48dbfb",
      icon: "◆",
      prompt: `You are a local SEO specialist. Analyze this website for local search optimization:
1. Google Business Profile optimization signals
2. NAP (Name, Address, Phone) consistency
3. Local keyword targeting and geo-specific content
4. Local schema markup (LocalBusiness, etc.)
5. Citation building and directory presence
6. Review management strategy
7. Local link building opportunities
8. Hyperlocal content strategy
9. Maps integration and location pages
10. Competitive local search landscape
Provide specific recommendations for improving local search visibility.`,
    },
  ];

  // ===== RENDER =====
  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      color: C.text,
      fontFamily: "'JetBrains Mono', 'Courier New', monospace",
      fontSize: 12,
    }}>
      {/* SCANLINE overlay */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;600;700&family=Syne:wght@700;800&display=swap');
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-track{background:#04060f}
        ::-webkit-scrollbar-thumb{background:#0f2040;border-radius:2px}
        ::-webkit-scrollbar-thumb:hover{background:#00d4ff44}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes scan{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        @keyframes glow{0%,100%{box-shadow:0 0 6px #00d4ff44}50%{box-shadow:0 0 18px #00d4ff88}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .log-entry{animation:fadeIn .2s ease forwards}
        .panel{background:${C.panel};border:1px solid ${C.border};border-radius:6px}
        .btn{cursor:pointer;border:none;outline:none;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.05em;transition:all .15s}
        .btn:active{transform:scale(.97)}
        .module-btn{background:#0a1020;border:1px solid #0f2040;border-radius:5px;padding:10px 12px;width:100%;text-align:left;color:${C.text};cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:space-between;font-family:'JetBrains Mono',monospace;font-size:11px}
        .module-btn:hover{background:#0e1830;border-color:var(--mc)}
        .module-btn.active{background:#0a1a30;border-color:var(--mc);box-shadow:0 0 12px var(--mc)44}
        .nav-btn{background:transparent;border:none;padding:8px 16px;cursor:pointer;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.1em;color:${C.dim};transition:all .2s;border-bottom:2px solid transparent}
        .nav-btn.active{color:${C.accent};border-bottom-color:${C.accent}}
        .nav-btn:hover{color:${C.text}}
        .stat-card{background:#080c1a;border:1px solid #0f2040;border-radius:6px;padding:16px;text-align:center}
        input{background:#04060f;border:1px solid #0f2040;color:${C.accent};font-family:'JetBrains Mono',monospace;font-size:12px;padding:10px 14px;border-radius:5px;outline:none;width:100%;transition:border-color .2s}
        input:focus{border-color:${C.accent};box-shadow:0 0 0 2px ${C.accent}22}
        input::placeholder{color:#1e3050}
        table{width:100%;border-collapse:collapse}
        th{text-align:left;padding:8px 12px;color:${C.dim};font-size:10px;letter-spacing:.15em;text-transform:uppercase;border-bottom:1px solid ${C.border}}
        td{padding:8px 12px;border-bottom:1px solid #0a1020;font-size:11px}
        tr:hover td{background:#0a1020}
      `}</style>

      {/* HEADER */}
      <header style={{
        borderBottom: `1px solid ${C.border}`,
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#060914",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, background: `linear-gradient(135deg,${C.accent},${C.accent2})`,
              borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 700, color: "#fff",
            }}>X</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.accent, letterSpacing: "0.2em", fontFamily: "'Syne', sans-serif" }}>XYNTRA</div>
              <div style={{ fontSize: 8, color: C.dim, letterSpacing: "0.2em" }}>AGENCY OS v2.0</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 2, marginLeft: 16 }}>
            {["dashboard", "admin", "history"].map(v => (
              <button key={v} className={`nav-btn ${view === v ? "active" : ""}`} onClick={() => setView(v)}>
                {v.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, animation: "pulse 2s infinite", display: "inline-block" }}></span>
            <span style={{ fontSize: 10, color: C.dim }}>NODE: ACTIVE</span>
          </div>
          <div style={{ fontSize: 10, color: C.dim, borderLeft: `1px solid ${C.border}`, paddingLeft: 16 }}>
            <span style={{ color: C.accent2 }}>⬡</span> {currentUser.email} <span style={{ color: C.yellow, marginLeft: 6 }}>[{currentUser.role}]</span>
          </div>
        </div>
      </header>

      {/* ============================= DASHBOARD VIEW ============================= */}
      {view === "dashboard" && (
        <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "320px 1fr", gap: 16, height: "calc(100vh - 57px)", overflow: "hidden" }}>

          {/* LEFT COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>
            {/* Target Input */}
            <div className="panel" style={{ padding: 16 }}>
              <div style={{ fontSize: 9, color: C.dim, letterSpacing: "0.2em", marginBottom: 8, textTransform: "uppercase" }}>// Target URL</div>
              <input
                type="url"
                value={targetUrl}
                onChange={e => setTargetUrl(e.target.value)}
                placeholder="https://client-website.com"
              />
              <div style={{ marginTop: 8, fontSize: 9, color: C.dim }}>Enter full URL including https://</div>
            </div>

            {/* Module Categories */}
            <div className="panel" style={{ padding: 16, flex: 1, overflowY: "auto" }}>
              <div style={{ fontSize: 9, color: C.dim, letterSpacing: "0.2em", marginBottom: 12, textTransform: "uppercase" }}>// Intelligence Modules</div>

              {["SEO", "Recon", "Content", "Strategy", "UX"].map(cat => (
                <div key={cat} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 8, color: C.dim, letterSpacing: "0.2em", marginBottom: 6, paddingBottom: 4, borderBottom: `1px solid ${C.border}`, textTransform: "uppercase" }}>[ {cat} ]</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {modules.filter(m => m.category === cat).map(mod => (
                      <button
                        key={mod.id}
                        className={`module-btn ${activeModule === mod.id ? "active" : ""}`}
                        style={{ "--mc": mod.color }}
                        onClick={() => runModule(mod.id, mod.label, mod.prompt)}
                        disabled={scanning}
                      >
                        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ color: mod.color, fontSize: 14 }}>{mod.icon}</span>
                          <span>{mod.label}</span>
                        </span>
                        <span style={{ fontSize: 9, color: activeModule === mod.id ? mod.color : C.dim }}>
                          {activeModule === mod.id ? (
                            <span style={{ animation: "pulse 0.8s infinite" }}>RUNNING...</span>
                          ) : "RUN ›"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, overflow: "hidden" }}>
            {/* Stats Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
              {[
                { label: "Total Scans", val: stats.totalScans, color: C.accent },
                { label: "Reports Generated", val: stats.reportsGen, color: C.accent2 },
                { label: "Active Clients", val: stats.activeClients, color: C.green },
                { label: "Avg SEO Score", val: `${stats.avgScore}/100`, color: C.yellow },
              ].map(s => (
                <div className="stat-card" key={s.label}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: s.color, fontFamily: "'Syne', sans-serif" }}>{s.val}</div>
                  <div style={{ fontSize: 9, color: C.dim, marginTop: 4, letterSpacing: "0.1em", textTransform: "uppercase" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Active Report + Terminal */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, flex: 1, minHeight: 0 }}>
              {/* Report Output */}
              <div className="panel" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: C.accent2, fontSize: 13 }}>◉</span>
                    <span style={{ fontSize: 10, color: C.text, letterSpacing: "0.1em", textTransform: "uppercase" }}>Intelligence Output</span>
                  </div>
                  {activeReport && (
                    <button
                      className="btn"
                      onClick={() => buildPDF({
                        url: activeReport.url,
                        scanId: activeReport.scanId,
                        date: activeReport.date,
                        operator: activeReport.operator,
                        sections: [{ title: activeReport.module + " — Analysis Report", content: activeReport.content }],
                      })}
                      style={{
                        background: `linear-gradient(135deg,${C.accent},${C.accent2})`,
                        color: "#fff", padding: "6px 14px", borderRadius: 4,
                        fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
                        display: "flex", alignItems: "center", gap: 6,
                      }}
                    >
                      ↓ EXPORT PDF
                    </button>
                  )}
                </div>
                <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
                  {scanning && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 16 }}>
                      <div style={{ width: 40, height: 40, border: `3px solid ${C.border}`, borderTop: `3px solid ${C.accent}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }}></div>
                      <div style={{ color: C.accent, fontSize: 11, letterSpacing: "0.2em", animation: "pulse 1.2s infinite" }}>
                        ANALYZING TARGET...
                      </div>
                    </div>
                  )}
                  {!scanning && activeReport && (
                    <div style={{ animation: "fadeIn 0.3s ease" }}>
                      <div style={{ marginBottom: 12, padding: "8px 12px", background: "#04060f", borderRadius: 4, borderLeft: `3px solid ${C.accent}` }}>
                        <div style={{ fontSize: 9, color: C.dim, marginBottom: 2 }}>MODULE // {activeReport.module}</div>
                        <div style={{ fontSize: 10, color: C.accent }}>{activeReport.url}</div>
                        <div style={{ fontSize: 9, color: C.dim, marginTop: 2 }}>SCAN ID: {activeReport.scanId} | {activeReport.date}</div>
                      </div>
                      <div style={{ color: C.text, lineHeight: 1.8, fontSize: 11, whiteSpace: "pre-wrap" }}>
                        {activeReport.content}
                      </div>
                    </div>
                  )}
                  {!scanning && !activeReport && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 8, opacity: 0.4 }}>
                      <div style={{ fontSize: 32, color: C.dim }}>◈</div>
                      <div style={{ fontSize: 10, color: C.dim, textAlign: "center", lineHeight: 2 }}>
                        Enter a target URL and<br />select a module to begin analysis.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Terminal Log */}
              <div className="panel" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
                  <span style={{ fontSize: 10, color: C.text, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    <span style={{ color: C.green }}>⬡</span> Live Log Stream
                  </span>
                </div>
                {{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 4 }}>
                  {logs.map(log => (
                    <div key={log.id} className="log-entry" style={{ display: "flex", gap: 10, fontSize: 10, lineHeight: 1.6 }}>
                      <span style={{ color: C.dim, flexShrink: 0 }}>{log.time}</span>
                      <span style={{
                        flexShrink: 0, fontWeight: 700, fontSize: 9, letterSpacing: "0.1em",
                        color: log.type === "ERROR" ? C.red : log.type === "WARNING" ? C.yellow : log.type === "RESULT" ? C.green : log.type === "CMD" ? C.accent : C.accent2,
                      }}>[{log.type}]</span>
                      <span style={{ color: C.text }}>{log.msg}</span>
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================= ADMIN VIEW ============================= */}
      {view === "admin" && (
        <div style={{ padding: "24px", overflowY: "auto", maxHeight: "calc(100vh - 57px)" }}>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, color: C.accent, letterSpacing: "0.1em" }}>ADMIN CONTROL PANEL</h2>
            <p style={{ color: C.dim, fontSize: 10, marginTop: 4 }}>Manage operators, clients, and platform settings</p>
          </div>

          {/* Admin Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
            {[
              { label: "Total Users", val: users.length, color: C.accent, icon: "◈" },
              { label: "Active Plans", val: users.filter(u => u.active).length, color: C.green, icon: "⬡" },
              { label: "Total Scans", val: users.reduce((a, u) => a + u.scans, 0), color: C.accent2, icon: "◉" },
              { label: "Revenue MRR", val: "$2,840", color: C.yellow, icon: "⊕" },
            ].map(s => (
              <div className="panel" key={s.label} style={{ padding: 20, display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ fontSize: 28, color: s.color }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: s.color, fontFamily: "'Syne', sans-serif" }}>{s.val}</div>
                  <div style={{ fontSize: 9, color: C.dim, letterSpacing: "0.1em", textTransform: "uppercase" }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* User Table */}
          <div className="panel" style={{ overflow: "hidden" }}>
            <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: C.text, letterSpacing: "0.1em", textTransform: "uppercase" }}>// Operator Registry</span>
              <button className="btn" style={{
                background: C.accent + "22", color: C.accent, border: `1px solid ${C.accent}44`,
                padding: "5px 14px", borderRadius: 4, fontSize: 10, letterSpacing: "0.1em",
              }}>+ ADD OPERATOR</button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Operator Email</th>
                  <th>Role</th>
                  <th>Plan</th>
                  <th>Total Scans</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={{ color: C.accent }}>{u.email}</td>
                    <td>
                      <span style={{
                        display: "inline-block", padding: "2px 8px", borderRadius: 3,
                        background: u.role === "ADMIN" ? C.yellow + "22" : C.accent2 + "22",
                        color: u.role === "ADMIN" ? C.yellow : C.accent2,
                        fontSize: 9, letterSpacing: "0.1em",
                      }}>{u.role}</span>
                    </td>
                    <td style={{ color: C.text }}>{u.plan}</td>
                    <td style={{ color: C.green }}>{u.scans}</td>
                    <td style={{ color: C.dim }}>{u.joined}</td>
                    <td>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        color: u.active ? C.green : C.red, fontSize: 10,
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: u.active ? C.green : C.red, display: "inline-block" }}></span>
                        {u.active ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn" style={{ background: C.accent + "15", color: C.accent, padding: "3px 10px", borderRadius: 3, border: `1px solid ${C.accent}30`, fontSize: 9 }}>EDIT</button>
                        {u.id !== 1 && <button className="btn" style={{ background: C.red + "15", color: C.red, padding: "3px 10px", borderRadius: 3, border: `1px solid ${C.red}30`, fontSize: 9 }}>REVOKE</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Plan Settings */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
            <div className="panel" style={{ padding: 20 }}>
              <div style={{ fontSize: 10, color: C.dim, letterSpacing: "0.15em", marginBottom: 16, textTransform: "uppercase" }}>// Plan Configuration</div>
              {[
                { name: "Starter", price: "$29/mo", scans: "25 scans", color: C.accent },
                { name: "Pro", price: "$79/mo", scans: "100 scans", color: C.accent2 },
                { name: "Enterprise", price: "$199/mo", scans: "Unlimited", color: C.yellow },
              ].map(p => (
                <div key={p.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#04060f", borderRadius: 4, marginBottom: 8, border: `1px solid ${p.color}22` }}>
                  <div>
                    <div style={{ color: p.color, fontWeight: 700, fontSize: 12 }}>{p.name}</div>
                    <div style={{ color: C.dim, fontSize: 9, marginTop: 2 }}>{p.scans}</div>
                  </div>
                  <div style={{ color: C.text, fontWeight: 700 }}>{p.price}</div>
                </div>
              ))}
            </div>
            <div className="panel" style={{ padding: 20 }}>
              <div style={{ fontSize: 10, color: C.dim, letterSpacing: "0.15em", marginBottom: 16, textTransform: "uppercase" }}>// System Status</div>
              {[
                { label: "API Gateway", status: "OPERATIONAL", color: C.green },
                { label: "AI Analysis Engine", status: "OPERATIONAL", color: C.green },
                { label: "PDF Export Service", status: "OPERATIONAL", color: C.green },
                { label: "Database", status: "OPERATIONAL", color: C.green },
                { label: "Auth Service", status: "OPERATIONAL", color: C.green },
              ].map(s => (
                <div key={s.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontSize: 11 }}>
                  <span style={{ color: C.text }}>{s.label}</span>
                  <span style={{ color: s.color, fontSize: 9, letterSpacing: "0.1em" }}>● {s.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================= HISTORY VIEW ============================= */}
      {view === "history" && (
        <div style={{ padding: "24px", overflowY: "auto", maxHeight: "calc(100vh - 57px)" }}>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, color: C.accent, letterSpacing: "0.1em" }}>SCAN HISTORY</h2>
            <p style={{ color: C.dim, fontSize: 10, marginTop: 4 }}>All previous intelligence operations</p>
          </div>

          {reports.length === 0 ? (
            <div className="panel" style={{ padding: 60, textAlign: "center", opacity: 0.4 }}>
              <div style={{ fontSize: 40, color: C.dim, marginBottom: 12 }}>◈</div>
              <div style={{ color: C.dim, fontSize: 11 }}>No scans yet. Run a module from the Dashboard.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {reports.map(r => {
                const mod = modules.find(m => m.id === r.moduleId);
                return (
                  <div key={r.id} className="panel" style={{ padding: 0, overflow: "hidden" }}>
                    <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#060914", borderBottom: `1px solid ${C.border}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <span style={{ color: mod?.color || C.accent, fontSize: 18 }}>{mod?.icon || "◈"}</span>
                        <div>
                          <div style={{ color: C.text, fontWeight: 700, fontSize: 12 }}>{r.module}</div>
                          <div style={{ color: C.dim, fontSize: 9, marginTop: 2 }}>{r.url} &nbsp;|&nbsp; {r.date}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          className="btn"
                          onClick={() => { setActiveReport(r); setView("dashboard"); }}
                          style={{ background: C.accent + "15", color: C.accent, padding: "5px 12px", borderRadius: 4, border: `1px solid ${C.accent}30`, fontSize: 10 }}
                        >VIEW</button>
                        <button
                          className="btn"
                          onClick={() => buildPDF({ url: r.url, scanId: r.scanId, date: r.date, operator: r.operator, sections: [{ title: r.module + " — Analysis Report", content: r.content }] })}
                          style={{ background: C.accent2 + "15", color: C.accent2, padding: "5px 12px", borderRadius: 4, border: `1px solid ${C.accent2}30`, fontSize: 10 }}
                        >↓ PDF</button>
                      </div>
                    </div>
                    <div style={{ padding: "12px 16px", color: C.dim, fontSize: 11, lineHeight: 1.6 }}>
                      {r.content.slice(0, 200)}...
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "8px 24px", display: "flex", justifyContent: "space-between", fontSize: 9, color: C.dim, letterSpacing: "0.1em" }}>
        <span>XYNTRA AGENCY OS // Node: Khuzdar_Alpha</span>
        <span>AI-Powered by Claude Sonnet // Encrypted Channel Active</span>
      </footer>
    </div>
  );
            }
