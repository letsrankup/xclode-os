"use client";
import { useState, useEffect, useRef } from "react";

// ── Animated counter hook ──────────────────────────────────────
function useCountUp(target, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target && target !== 0) return;
    let start = 0;
    const step = Math.max(1, Math.ceil(target / (duration / 16)));
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(start);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return val;
}

// ── Score ring ─────────────────────────────────────────────────
function ScoreRing({ score, max = 100, size = 120, stroke = 8, color }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(score / max, 1);
  const [dash, setDash] = useState(0);
  useEffect(() => { const t = setTimeout(() => setDash(circ * pct), 200); return () => clearTimeout(t); }, [circ, pct]);
  const animated = useCountUp(score);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1a1a2e" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={circ - dash}
        style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1)", strokeLinecap: "round" }}/>
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
        style={{ fill: color, fontSize: size * 0.22, fontFamily: "monospace", fontWeight: 700, transform: "rotate(90deg)", transformOrigin: "50% 50%" }}>
        {animated}
      </text>
    </svg>
  );
}

// ── Score bar ─────────────────────────────────────────────────
function StatBar({ label, value, max, color }) {
  const pct = Math.min((value / max) * 100, 100);
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), 300); return () => clearTimeout(t); }, [pct]);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 11, fontFamily: "monospace" }}>
        <span style={{ color: "#667788" }}>{label}</span>
        <span style={{ color }}>{value}/{max}</span>
      </div>
      <div style={{ height: 3, background: "#1a1a2e", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${w}%`, background: color, borderRadius: 2, transition: "width 1.3s cubic-bezier(.4,0,.2,1)" }}/>
      </div>
    </div>
  );
}

// ── Card ─────────────────────────────────────────────────────
function Card({ title, icon, accent = "#00ff9d", children }) {
  return (
    <div style={{ background: "#0c0c18", border: `1px solid ${accent}1a`, borderLeft: `3px solid ${accent}`, borderRadius: 2, padding: "18px 20px", marginBottom: 14 }}>
      <div style={{ fontFamily: "monospace", fontSize: 10, color: accent, letterSpacing: 3, textTransform: "uppercase", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
        <span>{icon}</span>{title}
      </div>
      {children}
    </div>
  );
}

// ── Row ───────────────────────────────────────────────────────
function Row({ label, value, status }) {
  const c = { ok: "#00ff9d", warn: "#ffcc00", err: "#ff4455", info: "#4488ff" }[status] || "#445566";
  const ic = { ok: "✓", warn: "!", err: "✗", info: "·" }[status] || "·";
  return (
    <div style={{ display: "flex", gap: 10, padding: "6px 0", borderBottom: "1px solid #ffffff07", alignItems: "flex-start" }}>
      <span style={{ color: c, fontSize: 10, marginTop: 1, width: 10, flexShrink: 0, fontFamily: "monospace" }}>{ic}</span>
      <span style={{ color: "#445566", fontSize: 11, fontFamily: "monospace", width: 150, flexShrink: 0 }}>{label}</span>
      <span style={{ color: "#aabbcc", fontSize: 11, fontFamily: "monospace", wordBreak: "break-all", flex: 1 }}>{value ?? "—"}</span>
    </div>
  );
}

// ── Issue item ────────────────────────────────────────────────
function Issue({ text, type }) {
  const map = { critical: ["#ff4455", "❌"], warning: ["#ffcc00", "⚠️"], info: ["#4488ff", "💡"] };
  const [color, icon] = map[type] || ["#445566", "·"];
  return (
    <div style={{ display: "flex", gap: 8, padding: "7px 10px", background: `${color}0c`, borderLeft: `2px solid ${color}44`, marginBottom: 5, borderRadius: "0 2px 2px 0" }}>
      <span style={{ fontSize: 12, flexShrink: 0 }}>{icon}</span>
      <span style={{ color: "#ccd", fontSize: 11, fontFamily: "monospace", lineHeight: 1.6 }}>{text}</span>
    </div>
  );
}

// ── Tag ───────────────────────────────────────────────────────
function Tag({ children, color }) {
  return <span style={{ background: `${color}18`, border: `1px solid ${color}44`, color, fontFamily: "monospace", fontSize: 10, padding: "2px 8px", borderRadius: 2, marginRight: 4, marginBottom: 4, display: "inline-block" }}>{children}</span>;
}

// ══════════════════════════════════════════════════════════════
export default function XyntraPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [data, setData] = useState(null);   // data = json.data
  const [rawText, setRawText] = useState(null); // fallback: json.result string
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [dots, setDots] = useState("");
  const inputRef = useRef();
  const resultsRef = useRef();

  // Progress ticker
  useEffect(() => {
    if (!loading) { setProgress(0); return; }
    let p = 5;
    const t = setInterval(() => { p = Math.min(p + Math.random() * 6, 90); setProgress(Math.round(p)); }, 250);
    return () => clearInterval(t);
  }, [loading]);

  // Dots animation
  useEffect(() => {
    if (!loading) { setDots(""); return; }
    const t = setInterval(() => setDots(d => d.length >= 3 ? "" : d + "."), 400);
    return () => clearInterval(t);
  }, [loading]);

  // Scroll to results
  useEffect(() => {
    if (data || rawText) {
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }, [data, rawText]);

  const runAudit = async () => {
    const trimmed = url.trim();
    if (!trimmed) { inputRef.current?.focus(); return; }

    setLoading(true); setError(null); setData(null); setRawText(null); setDebugInfo(null);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });

      // HTTP error?
      if (!res.ok) {
        setError(`Server returned HTTP ${res.status} — Check your route.js path (app/api/audit/route.js)`);
        setDebugInfo(`Status: ${res.status} ${res.statusText}`);
        return;
      }

      let json;
      try {
        json = await res.json();
      } catch {
        setError("Backend response is not valid JSON — Check route.js for syntax errors");
        return;
      }

      setProgress(100);

      // Happy path: structured data object
      if (json?.data && typeof json.data === "object") {
        setTimeout(() => setData(json.data), 200);
      }
      // Fallback: plain text report string
      else if (json?.result && typeof json.result === "string") {
        setTimeout(() => setRawText(json.result), 200);
      }
      else {
        setError("Backend returned unexpected format");
        setDebugInfo(JSON.stringify(json, null, 2).substring(0, 500));
      }

    } catch (e) {
      // This means /api/audit itself 404'd or network is down
      if (e.message?.includes("Failed to fetch") || e.message?.includes("NetworkError")) {
        setError("Cannot reach /api/audit — Route file missing or wrong path");
        setDebugInfo("Make sure file is at: app/api/audit/route.js\nAnd it exports: export async function POST(request) {}");
      } else {
        setError(`Error: ${e.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Grade color
  const gradeColor = !data ? "#00ff9d"
    : data.score?.total >= 80 ? "#00ff9d"
    : data.score?.total >= 60 ? "#ffcc00"
    : data.score?.total >= 40 ? "#ff8800"
    : "#ff4455";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #06060f; color: #ccd; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0a15; }
        ::-webkit-scrollbar-thumb { background: #00ff9d33; }
        input::placeholder { color: #2a3a4a; }
        input:focus { outline: none; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .fu { animation: fadeUp .45s ease both; }
        .fu1 { animation: fadeUp .45s .08s ease both; }
        .fu2 { animation: fadeUp .45s .16s ease both; }
        .fu3 { animation: fadeUp .45s .24s ease both; }
        .fu4 { animation: fadeUp .45s .32s ease both; }
        button { transition: filter .15s, transform .1s; }
        button:hover:not(:disabled) { filter: brightness(1.12); }
        button:active:not(:disabled) { transform: scale(0.97); }
      `}</style>

      <div style={{ background: "#06060f", minHeight: "100vh", paddingBottom: 80 }}>

        {/* ── Navbar ────────────────────────────────────────── */}
        <div style={{ position: "sticky", top: 0, zIndex: 100, background: "#06060fee", backdropFilter: "blur(16px)", borderBottom: "1px solid #ffffff0a", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 28, height: 28, border: "2px solid #00ff9d", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 8, height: 8, background: "#00ff9d", animation: "blink 1.8s infinite" }}/>
            </div>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 16, color: "#00ff9d", letterSpacing: 3 }}>XYNTRA</div>
              <div style={{ fontFamily: "monospace", fontSize: 9, color: "#334455", letterSpacing: 2 }}>SEO AUDIT ENGINE v9.0</div>
            </div>
          </div>
          {loading && (
            <div style={{ fontFamily: "monospace", fontSize: 10, color: "#00ff9d" }}>
              SCANNING{dots} {progress}%
            </div>
          )}
        </div>

        <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 16px" }}>

          {/* ── Hero ─────────────────────────────────────────── */}
          <div className="fu" style={{ padding: "48px 0 32px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 32, color: "#e8eaf0", letterSpacing: -1, marginBottom: 6 }}>
              Deep Website Audit
            </div>
            <div style={{ fontFamily: "monospace", fontSize: 11, color: "#334455", letterSpacing: 3, marginBottom: 36 }}>
              SEO · PERFORMANCE · TECHNICAL · SECURITY
            </div>

            {/* Input */}
            <div style={{ display: "flex", maxWidth: 620, margin: "0 auto", border: "1px solid #00ff9d33", borderRadius: 2 }}>
              <input
                ref={inputRef}
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === "Enter" && runAudit()}
                placeholder="https://example.com"
                style={{ flex: 1, background: "#0d0d1a", border: "none", padding: "13px 16px", color: "#e8eaf0", fontFamily: "monospace", fontSize: 13 }}
              />
              <button
                onClick={runAudit}
                disabled={loading}
                style={{ background: loading ? "#00bb77" : "#00ff9d", color: "#000", border: "none", padding: "13px 24px", fontFamily: "monospace", fontWeight: 700, fontSize: 11, letterSpacing: 2, cursor: loading ? "not-allowed" : "pointer" }}>
                {loading ? `SCANNING` : "RUN AUDIT →"}
              </button>
            </div>

            {/* Progress */}
            {loading && (
              <div style={{ maxWidth: 620, margin: "10px auto 0", height: 2, background: "#1a1a2e" }}>
                <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#00ff9d,#00ccff)", transition: "width .3s ease" }}/>
              </div>
            )}
          </div>

          {/* ── Error ─────────────────────────────────────────── */}
          {error && (
            <div className="fu" style={{ background: "#ff445511", border: "1px solid #ff445533", padding: "14px 18px", marginBottom: 20, borderRadius: 2 }}>
              <div style={{ fontFamily: "monospace", fontSize: 12, color: "#ff8899", marginBottom: debugInfo ? 10 : 0 }}>❌ {error}</div>
              {debugInfo && (
                <pre style={{ fontFamily: "monospace", fontSize: 10, color: "#ff445566", marginTop: 8, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{debugInfo}</pre>
              )}
            </div>
          )}

          {/* ── Raw text fallback ─────────────────────────────── */}
          {rawText && !data && (
            <div ref={resultsRef} className="fu" style={{ background: "#0a0a14", border: "1px solid #00ff9d22", padding: 20, borderRadius: 2 }}>
              <div style={{ fontFamily: "monospace", fontSize: 10, color: "#00ff9d", letterSpacing: 3, marginBottom: 12 }}>// RAW AUDIT REPORT</div>
              <pre style={{ fontFamily: "monospace", fontSize: 11, color: "#8899aa", whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.7 }}>{rawText}</pre>
            </div>
          )}

          {/* ══════════════════════════════════════════════════
               STRUCTURED RESULTS
          ══════════════════════════════════════════════════ */}
          {data && (
            <div ref={resultsRef}>

              {/* ── Score Hero ──────────────────────────────── */}
              <div className="fu" style={{ background: "linear-gradient(135deg,#0d0d1a,#09090f)", border: `1px solid ${gradeColor}22`, borderRadius: 2, padding: "28px 24px", marginBottom: 14, display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap" }}>
                <ScoreRing score={data.score?.total ?? 0} color={gradeColor} size={120} stroke={8}/>
                <div style={{ flex: "1 1 180px" }}>
                  <div style={{ fontFamily: "monospace", fontSize: 9, color: "#334455", letterSpacing: 3, marginBottom: 4 }}>OVERALL SCORE</div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 52, color: gradeColor, lineHeight: 1 }}>{data.grade?.grade ?? "?"}</div>
                  <div style={{ fontFamily: "monospace", fontSize: 11, color: "#667788", marginTop: 4 }}>{data.grade?.label}</div>
                  <div style={{ fontFamily: "monospace", fontSize: 10, color: "#334455", marginTop: 10 }}>
                    {data.domain} &nbsp;·&nbsp; HTTP {data.httpCode} &nbsp;·&nbsp; {data.loadTime}ms &nbsp;·&nbsp; {data.pageSize}KB
                  </div>
                  <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <Tag color={data.isHttps ? "#00ff9d" : "#ff4455"}>{data.isHttps ? "🔒 HTTPS" : "⚠ HTTP"}</Tag>
                    <Tag color={data.loadTime < 1500 ? "#00ff9d" : data.loadTime < 2500 ? "#ffcc00" : "#ff4455"}>
                      {data.loadTime < 1500 ? "⚡ Fast" : data.loadTime < 2500 ? "🟡 Moderate" : "🔴 Slow"}
                    </Tag>
                  </div>
                </div>
                <div style={{ flex: "2 1 220px" }}>
                  <StatBar label="SEO" value={data.score?.seo ?? 0} max={40} color="#00ff9d"/>
                  <StatBar label="SOCIAL" value={data.score?.social ?? 0} max={10} color="#00ccff"/>
                  <StatBar label="PERFORMANCE" value={data.score?.performance ?? 0} max={25} color="#aa88ff"/>
                  <StatBar label="TECHNICAL" value={data.score?.technical ?? 0} max={15} color="#ffcc00"/>
                  <StatBar label="SECURITY" value={data.score?.security ?? 0} max={10} color="#ff6688"/>
                </div>
              </div>

              {/* ── Issue Summary ────────────────────────────── */}
              <div className="fu1" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 14 }}>
                {[
                  ["CRITICAL", data.issues?.critical?.length ?? 0, "#ff4455"],
                  ["WARNINGS", data.issues?.warnings?.length ?? 0, "#ffcc00"],
                  ["OPPORTUNITIES", data.issues?.info?.length ?? 0, "#4488ff"],
                ].map(([label, count, color]) => (
                  <div key={label} style={{ background: "#0c0c18", border: `1px solid ${color}18`, borderTop: `3px solid ${color}`, padding: "14px 12px", textAlign: "center" }}>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 28, color }}>{count}</div>
                    <div style={{ fontFamily: "monospace", fontSize: 9, color: "#445566", letterSpacing: 2 }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* ── Meta Tags ────────────────────────────────── */}
              <div className="fu2">
                <Card title="Meta Tags" icon="🏷" accent="#00ff9d">
                  <Row label="Title" value={data.meta?.title?.substring(0, 70) ?? "MISSING"} status={data.meta?.title ? "ok" : "err"}/>
                  <Row label="Title Length"
                    value={`${data.meta?.title?.length ?? 0} chars ${data.meta?.title?.length >= 30 && data.meta?.title?.length <= 60 ? "✓ Perfect" : data.meta?.title?.length > 60 ? "⚠ Too Long" : "⚠ Too Short"}`}
                    status={data.meta?.title?.length >= 30 && data.meta?.title?.length <= 60 ? "ok" : "warn"}/>
                  <Row label="Description" value={data.meta?.description?.substring(0, 100) ?? "MISSING"} status={data.meta?.description ? "ok" : "err"}/>
                  <Row label="Desc Length"
                    value={`${data.meta?.description?.length ?? 0} chars ${data.meta?.description?.length >= 120 && data.meta?.description?.length <= 160 ? "✓ Perfect" : data.meta?.description?.length > 160 ? "⚠ Too Long" : data.meta?.description ? "⚠ Too Short" : ""}`}
                    status={data.meta?.description?.length >= 120 && data.meta?.description?.length <= 160 ? "ok" : data.meta?.description ? "warn" : "err"}/>
                  <Row label="Canonical" value={data.meta?.canonical ?? "Missing"} status={data.meta?.canonical ? "ok" : "warn"}/>
                  <Row label="Language" value={data.meta?.lang ?? "Missing"} status={data.meta?.lang ? "ok" : "warn"}/>
                  <Row label="Viewport" value={data.meta?.viewport ?? "MISSING"} status={data.meta?.viewport ? "ok" : "err"}/>
                  <Row label="Charset" value={data.meta?.charset ?? "Not detected"} status={data.meta?.charset ? "ok" : "warn"}/>
                  <Row label="Favicon" value={data.meta?.favicon ? "Detected" : "Not found"} status={data.meta?.favicon ? "ok" : "warn"}/>
                  <Row label="Author" value={data.meta?.author ?? "Not set"} status={data.meta?.author ? "ok" : "info"}/>
                  <Row label="Keywords" value={data.meta?.keywords?.substring(0, 80) ?? "Not set"} status={data.meta?.keywords ? "ok" : "info"}/>
                </Card>
              </div>

              {/* ── Open Graph ───────────────────────────────── */}
                      </Card>

                <Card title="Content Analysis" icon="📄" accent="#ffcc00">
                  <Row label="Word Count" value={`${data.content?.wordCount ?? 0} words`}
                    status={data.content?.wordCount >= 600 ? "ok" : data.content?.wordCount >= 300 ? "warn" : "err"}/>
                  <Row label="Reading Time" value={`~${data.content?.readingTime ?? 0} min`} status="info"/>
                  <Row label="Paragraphs" value={data.content?.paragraphs ?? 0} status="info"/>
                  <Row label="Structured Data" value={data.content?.hasSchema ? "Schema.org Found ✓" : "None detected"} status={data.content?.hasSchema ? "ok" : "warn"}/>
                  {data.content?.schemaTypes?.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontFamily: "monospace", fontSize: 9, color: "#445566", letterSpacing: 2, marginBottom: 6 }}>SCHEMA TYPES</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {data.content.schemaTypes.map((t, i) => <Tag key={i} color="#ffcc00">{t}</Tag>)}
                      </div>
                    </div>
                  )}
                </Card>
              </div>

              {/* ── Images + Links ─── 2 col ─────────────────── */}
              <div className="fu3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Card title="Images & Media" icon="🖼" accent="#ff88aa">
                  <Row label="Total Images" value={data.images?.total ?? 0} status="info"/>
                  <Row label="With Alt Text" value={data.images?.withAlt ?? 0} status={data.images?.withAlt === data.images?.total ? "ok" : "warn"}/>
                  <Row label="Missing Alt" value={data.images?.missingAlt ?? 0} status={data.images?.missingAlt > 0 ? "err" : "ok"}/>
                  <Row label="Lazy Loading" value={`${data.images?.lazy ?? 0} images`} status={data.images?.lazy > 0 ? "ok" : "warn"}/>
                  <Row label="Logo Detected" value={data.images?.hasLogo ? "Found ✓" : "Not detected"} status={data.images?.hasLogo ? "ok" : "warn"}/>
                </Card>

                <Card title="Links Profile" icon="🔗" accent="#4488ff">
                  <Row label="Total Links" value={data.links?.total ?? 0} status="info"/>
                  <Row label="Internal" value={data.links?.internal ?? 0} status="info"/>
                  <Row label="External" value={data.links?.external ?? 0} status={data.links?.external > 0 ? "ok" : "info"}/>
                  <Row label="Nofollow" value={data.links?.nofollow ?? 0} status="info"/>
                  {data.links?.externalDomains?.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontFamily: "monospace", fontSize: 9, color: "#445566", letterSpacing: 2, marginBottom: 6 }}>LINKING TO</div>
                      {data.links.externalDomains.slice(0, 6).map((d, i) => (
                        <div key={i} style={{ fontFamily: "monospace", fontSize: 10, color: "#8899bb", padding: "3px 0", borderBottom: "1px solid #ffffff06" }}>↗ {d}</div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

              {/* ── Technical SEO ────────────────────────────── */}
              <div className="fu4">
                <Card title="Technical SEO" icon="⚙️" accent="#00ccff">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
                    <Row label="Sitemap XML" value={data.technical?.sitemapOk ? "Found ✓" : "Missing"} status={data.technical?.sitemapOk ? "ok" : "warn"}/>
                    <Row label="Robots.txt" value={data.technical?.hasRobotsTxt ? (data.technical?.robotsBlocked ? "⚠ Blocking crawlers!" : "Configured ✓") : "Not found"} status={data.technical?.hasRobotsTxt && !data.technical?.robotsBlocked ? "ok" : data.technical?.robotsBlocked ? "err" : "warn"}/>
                    <Row label="CSS Files" value={data.technical?.cssFiles ?? 0} status="info"/>
                    <Row label="JS Files" value={data.technical?.jsFiles ?? 0} status={data.technical?.jsFiles > 10 ? "warn" : "ok"}/>
                    <Row label="GZip" value={data.technical?.hasGzip ? "Enabled ✓" : "Not detected"} status={data.technical?.hasGzip ? "ok" : "warn"}/>
                    <Row label="Cache Headers" value={data.technical?.hasCacheHeader ? "Set ✓" : "Missing"} status={data.technical?.hasCacheHeader ? "ok" : "warn"}/>
                    <Row label="AMP" value={data.technical?.hasAmp ? "Implemented" : "Not used"} status="info"/>
                    <Row label="PWA" value={data.technical?.hasPwa ? "Detected ✓" : "Not implemented"} status={data.technical?.hasPwa ? "ok" : "info"}/>
                  </div>
                </Card>
              </div>

              {/* ── Security ─────────────────────────────────── */}
              <div className="fu4">
                <Card title="Security Headers" icon="🔐" accent="#ff6688">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
                    <Row label="HTTPS / SSL" value={data.security?.isHttps ? "Secure ✓" : "NOT SECURE ❌"} status={data.security?.isHttps ? "ok" : "err"}/>
                    <Row label="HSTS" value={data.security?.hsts ? "Present ✓" : "Missing"} status={data.security?.hsts ? "ok" : "warn"}/>
                    <Row label="X-Frame-Options" value={data.security?.xFrame ? "Present ✓" : "Missing"} status={data.security?.xFrame ? "ok" : "warn"}/>
                    <Row label="Content-Sec-Policy" value={data.security?.csp ? "Set ✓" : "Missing"} status={data.security?.csp ? "ok" : "warn"}/>
                    <Row label="X-Content-Type" value={data.security?.xContent ? "Present ✓" : "Missing"} status={data.security?.xContent ? "ok" : "warn"}/>
                  </div>
                </Card>
              </div>

              {/* ── Issues ───────────────────────────────────── */}
              {data.issues?.critical?.length > 0 && (
                <div className="fu4">
                  <Card title={`Critical Issues (${data.issues.critical.length}) — Fix Immediately`} icon="🚨" accent="#ff4455">
                    {data.issues.critical.map((t, i) => <Issue key={i} text={t} type="critical"/>)}
                  </Card>
                </div>
              )}
              {data.issues?.warnings?.length > 0 && (
                <div className="fu4">
                  <Card title={`Warnings (${data.issues.warnings.length}) — Fix Soon`} icon="⚠️" accent="#ffcc00">
                    {data.issues.warnings.map((t, i) => <Issue key={i} text={t} type="warning"/>)}
                  </Card>
                </div>
              )}
              {data.issues?.info?.length > 0 && (
                <div className="fu4">
                  <Card title={`Opportunities (${data.issues.info.length})`} icon="💡" accent="#4488ff">
                    {data.issues.info.map((t, i) => <Issue key={i} text={t} type="info"/>)}
                  </Card>
                </div>
              )}

              {/* ── Action Plan ──────────────────────────────── */}
              {(data.issues?.critical?.length > 0 || data.issues?.warnings?.length > 0) && (
                <div className="fu4">
                  <Card title="Priority Action Plan" icon="📈" accent="#00ff9d">
                    {[
                      ...(data.issues?.critical ?? []).map(c => ({ text: c, type: "critical", prefix: "🔴 URGENT" })),
                      ...(data.issues?.warnings ?? []).slice(0, 5).map(w => ({ text: w, type: "warning", prefix: "🟡 SOON" })),
                      ...(data.issues?.info ?? []).slice(0, 3).map(i => ({ text: i, type: "info", prefix: "🔵 LATER" })),
                    ].slice(0, 10).map((item, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, padding: "7px 10px", background: "#ffffff04", borderBottom: "1px solid #ffffff06", fontFamily: "monospace", fontSize: 11 }}>
                        <span style={{ color: "#445566", width: 18, flexShrink: 0 }}>{i + 1}.</span>
                        <span style={{ color: "#8899aa", width: 90, flexShrink: 0, fontSize: 10 }}>{item.prefix}</span>
                        <span style={{ color: "#aabbcc", flex: 1 }}>{item.text}</span>
                      </div>
                    ))}
                  </Card>
                </div>
              )}

              {/* Footer */}
              <div style={{ textAlign: "center", padding: "28px 0 0", fontFamily: "monospace", fontSize: 10, color: "#1a2a3a", letterSpacing: 3 }}>
                XYNTRA PRO · AUDIT COMPLETE · {data.domain}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!data && !loading && !error && !rawText && (
            <div style={{ textAlign: "center", padding: "60px 0", fontFamily: "monospace", fontSize: 11, color: "#223344" }}>
              <div style={{ fontSize: 28, marginBottom: 12, color: "#00ff9d33" }}>◉</div>
              Enter a URL above and press RUN AUDIT
            </div>
          )}

        </div>
      </div>
    </>
  );
                      }
