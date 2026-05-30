"use client";
import { useState, useEffect, useRef } from "react";

// ── Animated counter hook ──────────────────────────────────────
function useCountUp(target, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
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
  useEffect(() => { setTimeout(() => setDash(circ * pct), 100); }, [circ, pct]);
  const animated = useCountUp(score);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1a1a2e" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={circ - dash}
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)", strokeLinecap: "round" }}/>
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
        style={{ fill: color, fontSize: size * 0.22, fontFamily: "'Space Mono',monospace", fontWeight: 700, transform: "rotate(90deg)", transformOrigin: "50% 50%" }}>
        {animated}
      </text>
    </svg>
  );
}

// ── Bar stat ───────────────────────────────────────────────────
function StatBar({ label, value, max, color }) {
  const pct = Math.min((value / max) * 100, 100);
  const [w, setW] = useState(0);
  useEffect(() => { setTimeout(() => setW(pct), 200); }, [pct]);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 11, fontFamily: "'Space Mono',monospace" }}>
        <span style={{ color: "#8888aa" }}>{label}</span>
        <span style={{ color }}>{value}/{max}</span>
      </div>
      <div style={{ height: 4, background: "#1a1a2e", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${w}%`, background: color, borderRadius: 2, transition: "width 1.2s cubic-bezier(.4,0,.2,1)" }}/>
      </div>
    </div>
  );
}

// ── Section card ───────────────────────────────────────────────
function Card({ title, icon, children, accent = "#00ff9d" }) {
  return (
    <div style={{
      background: "linear-gradient(135deg,#0d0d1a 0%,#090914 100%)",
      border: `1px solid ${accent}22`,
      borderLeft: `3px solid ${accent}`,
      borderRadius: 2, padding: "20px 24px", marginBottom: 16
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <span style={{ color: accent, fontFamily: "'Space Mono',monospace", fontSize: 11, letterSpacing: 3, textTransform: "uppercase" }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

// ── Meta row ───────────────────────────────────────────────────
function MetaRow({ label, value, status }) {
  const statusColor = status === "ok" ? "#00ff9d" : status === "warn" ? "#ffcc00" : status === "err" ? "#ff4455" : "#8888aa";
  const statusIcon = status === "ok" ? "✓" : status === "warn" ? "⚠" : status === "err" ? "✗" : "·";
  return (
    <div style={{ display: "flex", gap: 12, padding: "7px 0", borderBottom: "1px solid #ffffff08", alignItems: "flex-start" }}>
      <span style={{ color: statusColor, fontSize: 10, marginTop: 2, width: 10, flexShrink: 0 }}>{statusIcon}</span>
      <span style={{ color: "#556", fontSize: 11, fontFamily: "'Space Mono',monospace", width: 160, flexShrink: 0 }}>{label}</span>
      <span style={{ color: "#ccd", fontSize: 11, fontFamily: "'Space Mono',monospace", wordBreak: "break-all", flex: 1 }}>{value || "—"}</span>
    </div>
  );
}

// ── Issue badge ────────────────────────────────────────────────
function IssueBadge({ text, type }) {
  const map = { critical: ["#ff4455", "❌"], warning: ["#ffcc00", "⚠"], info: ["#4488ff", "💡"] };
  const [color, icon] = map[type];
  return (
    <div style={{ display: "flex", gap: 8, padding: "8px 10px", background: `${color}0d`, borderLeft: `2px solid ${color}44`, marginBottom: 6, borderRadius: "0 2px 2px 0" }}>
      <span style={{ fontSize: 11 }}>{icon}</span>
      <span style={{ color: "#ccd", fontSize: 11, fontFamily: "'Space Mono',monospace", lineHeight: 1.5 }}>{text}</span>
    </div>
  );
}

// ── Scanline overlay ───────────────────────────────────────────
const scanlineStyle = {
  position: "fixed", inset: 0, pointerEvents: "none", zIndex: 9999,
  background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px)"
};

// ══════════════════════════════════════════════════════════════
//  MAIN PAGE
// ══════════════════════════════════════════════════════════════
export default function XyntraOS() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [dots, setDots] = useState("");
  const inputRef = useRef();

  // Fake progress ticker while loading
  useEffect(() => {
    if (!loading) { setProgress(0); return; }
    let p = 0;
    const t = setInterval(() => {
      p += Math.random() * 8;
      if (p > 92) p = 92;
      setProgress(Math.round(p));
    }, 180);
    return () => clearInterval(t);
  }, [loading]);
  
  // Animated dots
  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => setDots(d => d.length >= 3 ? "" : d + "."), 400);
    return () => clearInterval(t);
  }, [loading]);

  const runAudit = async () => {
    const trimmed = url.trim();
    if (!trimmed) { inputRef.current?.focus(); return; }
    setLoading(true); setError(null); setData(null);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const json = await res.json();
      if (json.data) {
        setProgress(100);
        setTimeout(() => setData(json.data), 300);
      } else {
        setError(json.result || "Unknown error");
      }
    } catch (e) {
      setError("Network error — cannot reach backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") runAudit(); };

  // ── Grade color ───────────────────────────────────────────────
  const gradeColor = data
    ? data.score.total >= 80 ? "#00ff9d"
      : data.score.total >= 60 ? "#ffcc00"
      : data.score.total >= 40 ? "#ff8800"
      : "#ff4455"
    : "#00ff9d";

  return (
    <>
      <div style={scanlineStyle}/>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #06060f; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #0a0a15; } ::-webkit-scrollbar-thumb { background: #00ff9d33; }
        ::selection { background: #00ff9d33; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes glitch {
          0%,100%{clip-path:inset(0 0 98% 0)} 10%{clip-path:inset(30% 0 50% 0)}
          20%{clip-path:inset(10% 0 85% 0)} 30%{clip-path:inset(60% 0 20% 0)}
          40%{clip-path:inset(0 0 98% 0)} 50%{clip-path:inset(45% 0 40% 0)}
          60%{clip-path:inset(15% 0 75% 0)} 70%{clip-path:inset(75% 0 10% 0)}
          80%{clip-path:inset(0 0 98% 0)} 90%{clip-path:inset(50% 0 30% 0)}
        }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp .5s ease forwards; }
        .fade-up-d1 { animation: fadeUp .5s .1s ease both; }
        .fade-up-d2 { animation: fadeUp .5s .2s ease both; }
        .fade-up-d3 { animation: fadeUp .5s .3s ease both; }
        input::placeholder { color: #334; }
        input:focus { outline: none; }
        button:hover { filter: brightness(1.1); }
        button:active { transform: scale(0.98); }
      `}</style>

      <div style={{ background: "#06060f", minHeight: "100vh", padding: "0 0 60px" }}>

        {/* ── Header ─────────────────────────────────────────── */}
        <div style={{ borderBottom: "1px solid #00ff9d18", padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#06060fee", backdropFilter: "blur(12px)", zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 32, height: 32, border: "2px solid #00ff9d", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              <div style={{ width: 10, height: 10, background: "#00ff9d", animation: "blink 1.6s infinite" }}/>
            </div>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 18, color: "#00ff9d", letterSpacing: 2 }}>XYNTRA</div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: "#445566", letterSpacing: 3 }}>SEO AUDIT ENGINE v9.0</div>
            </div>
          </div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#334455" }}>
            {new Date().toLocaleTimeString("en-US", { hour12: false })} UTC
          </div>
        </div>
<div style={{ maxWidth: 920, margin: "0 auto", padding: "0 20px" }}>

          {/* ── Hero Input ─────────────────────────────────────── */}
          <div className="fade-up" style={{ padding: "48px 0 32px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 36, color: "#e8eaf0", letterSpacing: -1, marginBottom: 8 }}>
              Deep Website Audit
            </div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: "#445", marginBottom: 36 }}>
              SEO · PERFORMANCE · TECHNICAL · SECURITY
            </div>

            <div style={{ display: "flex", gap: 0, maxWidth: 640, margin: "0 auto", border: "1px solid #00ff9d44", borderRadius: 2 }}>
              <input
                ref={inputRef}
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={handleKey}
                placeholder="https://target-website.com"
                style={{
                  flex: 1, background: "#0d0d1a", border: "none", padding: "14px 18px",
                  color: "#e8eaf0", fontFamily: "'Space Mono',monospace", fontSize: 13
                }}
              />
              <button
                onClick={runAudit}
                disabled={loading}
                style={{
                  background: loading ? "#00cc7a" : "#00ff9d", color: "#000", border: "none",
                  padding: "14px 28px", fontFamily: "'Space Mono',monospace", fontWeight: 700,
                  fontSize: 12, letterSpacing: 2, cursor: loading ? "not-allowed" : "pointer",
                  whiteSpace: "nowrap", transition: "all .2s"
                }}>
                {loading ? `SCANNING${dots}` : "RUN AUDIT →"}
              </button>
            </div>

            {/* Progress bar */}
            {loading && (
              <div style={{ maxWidth: 640, margin: "12px auto 0", height: 2, background: "#1a1a2e", borderRadius: 1 }}>
                <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#00ff9d,#00ccff)", borderRadius: 1, transition: "width .2s ease" }}/>
              </div>
            )}
          </div>

          {/* ── Error ─────────────────────────────────────────── */}
          {error && (
            <div className="fade-up" style={{ background: "#ff445511", border: "1px solid #ff445533", borderRadius: 2, padding: "16px 20px", marginBottom: 24, fontFamily: "'Space Mono',monospace", fontSize: 12, color: "#ff8899" }}>
              ❌ {error}
            </div>
          )}

          {/* ── Results ───────────────────────────────────────── */}
          {data && (
            <div>

              {/* Score Hero */}
              <div className="fade-up" style={{
                background: "linear-gradient(135deg,#0d0d1a,#0a0a14)",
                border: `1px solid ${gradeColor}33`,
                borderRadius: 2, padding: "32px 28px", marginBottom: 20,
                display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap"
              }}>
                <ScoreRing score={data.score.total} color={gradeColor} size={130} stroke={9}/>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 13, color: "#445566", letterSpacing: 3, marginBottom: 4 }}>OVERALL SCORE</div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 48, color: gradeColor, lineHeight: 1 }}>{data.grade.grade}</div>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 12, color: "#778899", marginTop: 4 }}>{data.grade.label}</div>
                  <div style={{ marginTop: 16, fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#445566" }}>
                    {data.domain} · HTTP {data.httpCode} · {data.loadTime}ms · {data.pageSize}KB
                  </div>
                </div>
                <div style={{ flex: 2, minWidth: 240 }}>
                  <StatBar label="SEO" value={data.score.seo} max={40} color="#00ff9d"/>
                  <StatBar label="SOCIAL" value={data.score.social} max={10} color="#00ccff"/>
                  <StatBar label="PERFORMANCE" value={data.score.performance} max={25} color="#aa88ff"/>
                  <StatBar label="TECHNICAL" value={data.score.technical} max={15} color="#ffcc00"/>
                  <StatBar label="SECURITY" value={data.score.security} max={10} color="#ff6688"/>
                </div>
              </div>

              {/* Issues row */}
              <div className="fade-up-d1" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
                {[
                  ["CRITICAL", data.issues.critical.length, "#ff4455"],
                  ["WARNINGS", data.issues.warnings.length, "#ffcc00"],
                  ["OPPORTUNITIES", data.issues.info.length, "#4488ff"],
                ].map(([label, count, color]) => (
                  <div key={label} style={{ background: "#0d0d1a", border: `1px solid ${color}22`, borderTop: `3px solid ${color}`, padding: "16px", textAlign: "center" }}>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 32, color }}>{count}</div>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#445566", letterSpacing: 2 }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Meta Tags */}
              <div className="fade-up-d2">
                <Card title="Meta Tags" icon="🏷" accent="#00ff9d">
                  <MetaRow label="Title" value={data.meta.title} status={data.meta.title ? "ok" : "err"}/>
                  <MetaRow label="Title Length" value={`${data.meta.title?.length || 0} chars`}
                    status={data.meta.title?.length >= 30 && data.meta.title?.length <= 60 ? "ok" : "warn"}/>
                  <MetaRow label="Description" value={data.meta.description?.substring(0, 120)} status={data.meta.description ? "ok" : "err"}/>
                  <MetaRow label="Desc Length" value={`${data.meta.description?.length || 0} chars`}
                    status={data.meta.description?.length >= 120 && data.meta.description?.length <= 160 ? "ok" : data.meta.description ? "warn" : "err"}/>
                  <MetaRow label="Canonical" value={data.meta.canonical} status={data.meta.canonical ? "ok" : "warn"}/>
                  <MetaRow label="Language" value={data.meta.lang} status={data.meta.lang ? "ok" : "warn"}/>
                  <MetaRow label="Viewport" value={data.meta.viewport} status={data.meta.viewport ? "ok" : "err"}/>
                  <MetaRow label="Charset" value={data.meta.charset} status={data.meta.charset ? "ok" : "warn"}/>
                  <MetaRow label="Favicon" value={data.meta.favicon ? "Found" : "Not detected"} status={data.meta.favicon ? "ok" : "warn"}/>
                  <MetaRow label="Author" value={data.meta.author} status={data.meta.author ? "ok" : "info"}/>
                  <MetaRow label="Keywords" value={data.meta.keywords?.substring(0, 80)} status={data.meta.keywords ? "ok" : "info"}/>
                </Card>
              </div>

              {/* OG & Social */}
              <div className="fade-up-d2">
                <Card title="Open Graph & Social" icon="📱" accent="#00ccff">
                  <MetaRow label="OG Title" value={data.og.ogTitle} status={data.og.ogTitle ? "ok" : "err"}/>
                  <MetaRow label="OG Description" value={data.og.ogDescription ? "Set" : "Missing"} status={data.og.ogDescription ? "ok" : "err"}/>
                  <MetaRow label="OG Image" value={data.og.ogImage?.substring(0, 80)} status={data.og.ogImage ? "ok" : "err"}/>
                  <MetaRow label="OG Type" value={data.og.ogType} status={data.og.ogType ? "ok" : "warn"}/>
                  <MetaRow label="Twitter Card" value={data.og.twitterCard} status={data.og.twitterCard ? "ok" : "warn"}/>
                </Card>
              </div>

              {/* Headings + Content */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Card title="Heading Structure" icon="📝" accent="#aa88ff">
                  {Object.entries(data.headings).map(([tag, count]) => (
                    <div key={tag} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #ffffff08", fontFamily: "'Space Mono',monospace", fontSize: 12 }}>
                      <span style={{ color: "#556", textTransform: "uppercase" }}>{tag}</span>
                      <span style={{ color: count === 0 && tag === "h1" ? "#ff4455" : count > 1 && tag === "h1" ? "#ffcc00" : "#ccd" }}>{count}</span>
                    </div>
                  ))}
                  {data.headingTexts?.h1?.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#445566", marginBottom: 6, letterSpacing: 2 }}>H1 FOUND</div>
                      {data.headingTexts.h1.map((t, i) => (
                        <div key={i} style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#9ab", padding: "4px 8px", background: "#ffffff06", borderLeft: "2px solid #aa88ff44", marginBottom: 4 }}>» {t}</div>
                      ))}
                    </div>
                  )}
                </Card>

                <Card title="Content Analysis" icon="📄" accent="#ffcc00">
                  <MetaRow label="Word Count" value={`${data.content.wordCount} words`}
                    status={data.content.wordCount >= 600 ? "ok" : data.content.wordCount >= 300 ? "warn" : "err"}/>
                  <MetaRow label="Reading Time" value={`~${data.content.readingTime} min`} status="info"/>
                  <MetaRow label="Paragraphs" value={data.content.paragraphs} status="info"/>
                  <MetaRow label="Structured Data" value={data.content.hasSchema ? "Schema.org found" : "None"} status={data.content.hasSchema ? "ok" : "warn"}/>
                  {data.content.schemaTypes?.length > 0 && (
                    <MetaRow label="Schema Types" value={data.content.schemaTypes.join(", ")} status="ok"/>
                  )}
                </Card>
              </div>

              {/* Images + Links */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Card title="Images & Media" icon="🖼" accent="#ff88aa">
                  <MetaRow label="Total Images" value={data.images.total} status="info"/>
                  <MetaRow label="With Alt Text" value={data.images.withAlt} status={data.images.withAlt === data.images.total ? "ok" : "warn"}/>
                  <MetaRow label="Missing Alt" value={data.images.missingAlt} status={data.images.missingAlt > 0 ? "err" : "ok"}/>
                  <MetaRow label="Lazy Loading" value={`${data.images.lazy} images`} status={data.images.lazy > 0 ? "ok" : "warn"}/>
                  <MetaRow label="Logo Detected" value={data.images.hasLogo ? "Yes" : "Not found"} status={data.images.hasLogo ? "ok" : "warn"}/>
                </Card>

                <Card title="Links Profile" icon="🔗" accent="#4488ff">
                  <MetaRow label="Total Links" value={data.links.total} status="info"/>
                  <MetaRow label="Internal" value={data.links.internal} status="info"/>
                  <MetaRow label="External" value={data.links.external} status={data.links.external > 0 ? "ok" : "info"}/>
                  <MetaRow label="Nofollow" value={data.links.nofollow} status="info"/>
                  {data.links.externalDomains?.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#445566", marginBottom: 6, letterSpacing: 2 }}>LINKING TO</div>
                      {data.links.externalDomains.slice(0, 5).map((d, i) => (
                        <div key={i} style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#9ab", padding: "3px 0", borderBottom: "1px solid #ffffff06" }}>↗ {d}</div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
{/* Technical */}
              <Card title="Technical SEO" icon="⚙" accent="#00ccff">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
                  <MetaRow label="Sitemap XML" value={data.technical.sitemapOk ? "Found" : "Missing"} status={data.technical.sitemapOk ? "ok" : "warn"}/>
                  <MetaRow label="Robots.txt" value={data.technical.hasRobotsTxt ? (data.technical.robotsBlocked ? "Blocking!" : "Configured") : "Missing"} status={data.technical.hasRobotsTxt && !data.technical.robotsBlocked ? "ok" : "err"}/>
                  <MetaRow label="CSS Files" value={data.technical.cssFiles} status="info"/>
                  <MetaRow label="JS Files" value={data.technical.jsFiles} status={data.technical.jsFiles > 10 ? "warn" : "ok"}/>
                  <MetaRow label="GZip" value={data.technical.hasGzip ? "Enabled" : "Not detected"} status={data.technical.hasGzip ? "ok" : "warn"}/>
                  <MetaRow label="Cache Headers" value={data.technical.hasCacheHeader ? "Set" : "Missing"} status={data.technical.hasCacheHeader ? "ok" : "warn"}/>
                  <MetaRow label="AMP" value={data.technical.hasAmp ? "Implemented" : "Not used"} status="info"/>
                  <MetaRow label="PWA" value={data.technical.hasPwa ? "Detected" : "Not implemented"} status="info"/>
                </div>
              </Card>

              {/* Security */}
              <Card title="Security Headers" icon="🔐" accent="#ff6688">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
                  <MetaRow label="HTTPS/SSL" value={data.security.isHttps ? "Secure" : "NOT SECURE"} status={data.security.isHttps ? "ok" : "err"}/>
                  <MetaRow label="HSTS" value={data.security.hsts ? "Present" : "Missing"} status={data.security.hsts ? "ok" : "warn"}/>
                  <MetaRow label="X-Frame-Options" value={data.security.xFrame ? "Present" : "Missing"} status={data.security.xFrame ? "ok" : "warn"}/>
                  <MetaRow label="Content-Sec-Policy" value={data.security.csp ? "Set" : "Missing"} status={data.security.csp ? "ok" : "warn"}/>
                  <MetaRow label="X-Content-Type" value={data.security.xContent ? "Present" : "Missing"} status={data.security.xContent ? "ok" : "warn"}/>
                </div>
              </Card>

              {/* Issues */}
              {data.issues.critical.length > 0 && (
                <Card title={`Critical Issues (${data.issues.critical.length})`} icon="🚨" accent="#ff4455">
                  {data.issues.critical.map((t, i) => <IssueBadge key={i} text={t} type="critical"/>)}
                </Card>
              )}
              {data.issues.warnings.length > 0 && (
                <Card title={`Warnings (${data.issues.warnings.length})`} icon="⚠" accent="#ffcc00">
                  {data.issues.warnings.map((t, i) => <IssueBadge key={i} text={t} type="warning"/>)}
                </Card>
              )}
              {data.issues.info.length > 0 && (
                <Card title={`Opportunities (${data.issues.info.length})`} icon="💡" accent="#4488ff">
                  {data.issues.info.map((t, i) => <IssueBadge key={i} text={t} type="info"/>)}
                </Card>
              )}

              {/* Footer */}
              <div style={{ textAlign: "center", padding: "24px 0", fontFamily: "'Space Mono',monospace", fontSize: 10, color: "#334455", letterSpacing: 2 }}>
                XYNTRA PRO · AUDIT COMPLETE · {data.domain}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!data && !loading && !error && (
            <div style={{ textAlign: "center", padding: "60px 0", fontFamily: "'Space Mono',monospace", fontSize: 12, color: "#334455" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>◉</div>
              Enter a URL above and press RUN AUDIT
            </div>
          )}

        </div>
      </div>
    </>
  );
                        }
