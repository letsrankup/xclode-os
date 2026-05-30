'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const USER_AGENTS = [
  { label: 'Chrome (Windows)', value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
  { label: 'Firefox (Linux)', value: 'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/121.0' },
  { label: 'Safari (Mac)', value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15' },
  { label: 'iPhone Safari', value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15' },
  { label: 'Googlebot', value: 'Googlebot/2.1 (+http://www.google.com/bot.html)' },
  { label: 'Bingbot', value: 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)' },
]

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [url, setUrl] = useState('')
  const [ua, setUa] = useState(USER_AGENTS[0].value)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [activeTab, setActiveTab] = useState('scan')

  useEffect(() => {
    const u = localStorage.getItem('user')
    if (!u) return router.push('/login')
    setUser(JSON.parse(u))
    setHistory(JSON.parse(localStorage.getItem('scanHistory') || '[]'))
  }, [])

  const scan = async () => {
    if (!url.trim()) return
    setLoading(true); setResult(null)
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ url: url.trim(), userAgent: ua })
      })
      const data = await res.json()
      setResult(data)
      if (!data.error) {
        const h = [{ url: url.trim(), score: data.seoScore, time: new Date().toISOString() }, ...history].slice(0, 20)
        setHistory(h)
        localStorage.setItem('scanHistory', JSON.stringify(h))
      }
    } catch { setResult({ error: 'Scan fail hua' }) }
    setLoading(false)
  }

  const logout = () => { localStorage.clear(); router.push('/') }

  if (!user) return null

  const ScoreRing = ({ score, label, color }) => (
    <div style={{ textAlign: 'center', padding: '1rem' }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', border: `4px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', background: `${color}15`, boxShadow: `0 0 20px ${color}30` }}>
        <span style={{ color, fontWeight: 900, fontSize: '1.3rem' }}>{score}</span>
      </div>
      <span style={{ color: '#555', fontSize: '0.75rem' }}>{label}</span>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#020008', color: '#fff', fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Topbar */}
      <div style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid #111', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #6c63ff, #a855f7)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🔍</div>
          <span style={{ fontWeight: 800, background: 'linear-gradient(90deg, #6c63ff, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '1.1rem' }}>XcloDE</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ color: '#555', fontSize: '0.85rem' }}>👤 {user.name}</span>
          {user.role === 'admin' && (
            <button onClick={() => router.push('/admin')} style={{ padding: '6px 14px', background: 'rgba(231,76,60,0.15)', color: '#e74c3c', border: '1px solid rgba(231,76,60,0.3)', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem' }}>Admin</button>
          )}
          <button onClick={logout} style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.05)', color: '#666', border: '1px solid #222', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem' }}>Logout</button>
        </div>
      </div>

      <div style={{ maxWidth: 950, margin: '0 auto', padding: '2rem 1rem' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
          {['scan', 'history'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              style={{ padding: '8px 20px', background: activeTab === t ? 'linear-gradient(135deg, #6c63ff, #a855f7)' : 'transparent', color: activeTab === t ? '#fff' : '#555', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, textTransform: 'capitalize', transition: 'all 0.2s' }}>
              {t === 'scan' ? '🔍 Scan' : '🕐 History'}
            </button>
          ))}
        </div>

        {activeTab === 'scan' && (
          <>
            {/* Scan Card */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(108,99,255,0.15)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.2rem', color: '#a78bfa' }}>🌐 Website Deep Scan</h2>

              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <input
                  placeholder="https://example.com — URL daalo"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && scan()}
                  style={{ flex: 1, minWidth: 200, padding: '12px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 10, color: '#fff', fontSize: '0.95rem', outline: 'none' }}
                />
                <button onClick={scan} disabled={loading}
                  style={{ padding: '12px 24px', background: loading ? '#222' : 'linear-gradient(135deg, #6c63ff, #a855f7)', color: loading ? '#555' : '#fff', border: 'none', borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700, whiteSpace: 'nowrap', transition: 'all 0.3s' }}>
                  {loading ? '⏳ Scanning...' : '🚀 Scan Karo'}
                </button>
              </div>

              <div>
                <label style={{ color: '#444', fontSize: '0.78rem', display: 'block', marginBottom: 6 }}>USER AGENT</label>
                <select value={ua} onChange={e => setUa(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid #222', borderRadius: 8, color: '#888', fontSize: '0.85rem', outline: 'none' }}>
                  {USER_AGENTS.map((a, i) => <option key={i} value={a.value}>{a.label}</option>)}
                </select>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#6c63ff' }}>
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>⚡</div>
                <p style={{ color: '#555' }}>200+ data points analyze ho rahe hain...</p>
              </div>
            )}

            {/* Results */}
            {result && !result.error && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {/* Score Ring Row */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #111', borderRadius: 16, padding: '1rem', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
                  <ScoreRing score={result.seoScore} label="SEO Score" color="#6c63ff" />
                  <ScoreRing score={result.performance} label="Performance" color="#2ecc71" />
                  <ScoreRing score={result.security} label="Security" color="#f39c12" />
                  <ScoreRing score={result.mobile} label="Mobile" color="#3498db" />
                </div>

                {/* Meta */}
                <ResultBlock title="📋 Meta Data" color="#6c63ff">
                  <Row k="Title" v={result.meta?.title} />
                  <Row k="Description" v={result.meta?.description} />
                  <Row k="Keywords" v={result.meta?.keywords} />
                  <Row k="Canonical" v={result.meta?.canonical} />
                  <Row k="OG Title" v={result.meta?.ogTitle} />
                  <Row k="OG Image" v={result.meta?.ogImage} />
                </ResultBlock>

                {/* Headers */}
                <ResultBlock title="🏷️ Heading Tags" color="#a855f7">
                  {result.headers?.slice(0, 8).map((h, i) => <Row key={i} k={h.tag} v={h.text} />)}
                  {result.headers?.length === 0 && <p style={{ color: '#e74c3c', fontSize: '0.85rem' }}>⚠️ Koi heading tag nahi mila</p>}
                </ResultBlock>

                {/* Links */}
                <ResultBlock title="🔗 Links Analysis" color="#2ecc71">
                  <Row k="Internal Links" v={result.links?.internal} />
                  <Row k="External Links" v={result.links?.external} />
                  <Row k="Total Links" v={(result.links?.internal || 0) + (result.links?.external || 0)} />
                  <Row k="Images Found" v={result.images?.total} />
                  <Row k="Images Alt Missing" v={result.images?.missingAlt} />
                </ResultBlock>

                {/* Technical */}
                <ResultBlock title="⚙️ Technical SEO" color="#f39c12">
                  <Row k="HTTPS" v={result.technical?.https ? '✅ Active' : '❌ Missing'} />
                  <Row k="robots.txt" v={result.technical?.robots ? '✅ Found' : '❌ Missing'} />
                  <Row k="sitemap.xml" v={result.technical?.sitemap ? '✅ Found' : '❌ Missing'} />
                  <Row k="Viewport Meta" v={result.technical?.viewport ? '✅ Set' : '❌ Missing'} />
                  <Row k="Load Time" v={`${result.technical?.loadTime}ms`} />
                  <Row k="Page Size" v={`${result.technical?.pageSize} KB`} />
                  <Row k="Word Count" v={result.technical?.wordCount} />
                </ResultBlock>

                {/* Recommendations */}
                {result.recommendations?.length > 0 && (
                  <ResultBlock title="💡 Fix List" color="#e74c3c">
                    {result.recommendations.map((r, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, padding: '8px 0', borderBottom: '1px solid #0f0f0f', fontSize: '0.85rem', color: '#f39c12' }}>
                        <span>⚠️</span><span>{r}</span>
                      </div>
                    ))}
                  </ResultBlock>
                )}
              </div>
            )}

            {result?.error && (
              <div style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.2)', borderRadius: 12, padding: '1.5rem', textAlign: 'center', color: '#e74c3c' }}>
                ❌ {result.error}
              </div>
            )}
          </>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid #111', borderRadius: 16, padding: '1.5rem' }}>
            <h3 style={{ color: '#a78bfa', marginBottom: '1rem' }}>🕐 Recent Scans</h3>
            {history.length === 0 ? (
              <p style={{ color: '#333', textAlign: 'center', padding: '2rem' }}>Abhi tak koi scan nahi kiya</p>
            ) : (
              history.map((h, i) => (
                <div key={i} onClick={() => { setUrl(h.url); setActiveTab('scan') }}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #0f0f0f', cursor: 'pointer' }}>
                  <span style={{ color: '#6c63ff', fontSize: '0.9rem' }}>{h.url}</span>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ background: `${h.score >= 70 ? '#2ecc71' : h.score >= 40 ? '#f39c12' : '#e74c3c'}20`, color: h.score >= 70 ? '#2ecc71' : h.score >= 40 ? '#f39c12' : '#e74c3c', padding: '2px 10px', borderRadius: 20, fontSize: '0.8rem' }}>{h.score}/100</span>
                    <span style={{ color: '#333', fontSize: '0.75rem' }}>{new Date(h.time).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const ResultBlock = ({ title, color, children }) => (
  <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${color}20`, borderRadius: 12, padding: '1.2rem' }}>
    <h4 style={{ color, fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', borderBottom: `1px solid ${color}15`, paddingBottom: 8 }}>{title}</h4>
    {children}
  </div>
)

const Row = ({ k, v }) => (
  <div style={{ display: 'flex', gap: '1rem', padding: '6px 0', fontSize: '0.85rem', borderBottom: '1px solid #0a0a0a' }}>
    <span style={{ color: '#444', minWidth: 140, flexShrink: 0 }}>{k}</span>
    <span style={{ color: '#bbb', wordBreak: 'break-all' }}>{v ?? '—'}</span>
  </div>
)
