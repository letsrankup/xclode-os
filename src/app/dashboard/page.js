// src/app/dashboard/page.js
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) AppleWebKit/605.1.15',
  'Googlebot/2.1 (+http://www.google.com/bot.html)',
]

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [url, setUrl] = useState('')
  const [selectedUA, setSelectedUA] = useState(USER_AGENTS[0])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (!stored) return router.push('/login')
    setUser(JSON.parse(stored))
    const h = JSON.parse(localStorage.getItem('scanHistory') || '[]')
    setHistory(h)
  }, [])

  const handleScan = async () => {
    if (!url) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ url, userAgent: selectedUA })
      })
      const data = await res.json()
      setResult(data)
      // Save to history
      const newHistory = [{ url, score: data.seoScore, date: new Date().toISOString() }, ...history].slice(0, 10)
      setHistory(newHistory)
      localStorage.setItem('scanHistory', JSON.stringify(newHistory))
    } catch (e) {
      setResult({ error: 'Scan failed' })
    }
    setLoading(false)
  }

  const logout = () => {
    localStorage.clear()
    router.push('/')
  }

  if (!user) return null

  return (
    <div style={{ minHeight: '100vh', background: '#0f0c29', color: '#fff', fontFamily: 'monospace' }}>
      {/* Navbar */}
      <nav style={{ background: '#1a1a2e', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333' }}>
        <span style={{ color: '#6c63ff', fontWeight: 'bold', fontSize: '1.2rem' }}>🔍 SEO Audit Pro</span>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ color: '#aaa' }}>👤 {user.name}</span>
          {user.role === 'admin' && (
            <button onClick={() => router.push('/admin')} style={{ ...smallBtn, background: '#e74c3c' }}>Admin</button>
          )}
          <button onClick={logout} style={{ ...smallBtn, background: '#555' }}>Logout</button>
        </div>
      </nav>

      <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' }}>
        {/* Scan Form */}
        <div style={cardStyle}>
          <h2 style={{ marginBottom: '1rem', color: '#6c63ff' }}>🌐 Website Deep Scanner</h2>

          <input
            placeholder="https://example.com"
            value={url}
            onChange={e => setUrl(e.target.value)}
            style={{ ...inputStyle, marginBottom: '1rem' }}
          />

          <label style={{ color: '#aaa', fontSize: '0.85rem', marginBottom: '0.4rem' }}>User Agent:</label>
          <select value={selectedUA} onChange={e => setSelectedUA(e.target.value)} style={{ ...inputStyle, marginBottom: '1rem' }}>
            {USER_AGENTS.map((ua, i) => (
              <option key={i} value={ua}>{ua.substring(0, 60)}...</option>
            ))}
          </select>

          <button onClick={handleScan} disabled={loading} style={{ padding: '12px', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>
            {loading ? '⏳ Scanning...' : '🚀 Start Deep Scan'}
          </button>
        </div>

        {/* Results */}
        {result && !result.error && (
          <div style={{ ...cardStyle, marginTop: '1.5rem' }}>
            <h3 style={{ color: '#2ecc71', marginBottom: '1rem' }}>📊 Scan Results</h3>

            {/* SEO Score */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              <ScoreCard label="SEO Score" value={result.seoScore} color="#6c63ff" />
              <ScoreCard label="Performance" value={result.performance} color="#2ecc71" />
              <ScoreCard label="Security" value={result.security} color="#f39c12" />
              <ScoreCard label="Mobile Score" value={result.mobile} color="#3498db" />
            </div>

            {/* Meta Info */}
            <Section title="📋 Meta Data">
              <Row label="Title" value={result.meta?.title} />
              <Row label="Description" value={result.meta?.description} />
              <Row label="Keywords" value={result.meta?.keywords} />
              <Row label="Canonical" value={result.meta?.canonical} />
            </Section>

            {/* Headers */}
            <Section title="🏷️ Headers Found">
              {result.headers?.map((h, i) => <Row key={i} label={h.tag} value={h.text} />)}
            </Section>

            {/* Links */}
            <Section title="🔗 Links Analysis">
              <Row label="Internal Links" value={result.links?.internal} />
              <Row label="External Links" value={result.links?.external} />
              <Row label="Broken Links" value={result.links?.broken} />
            </Section>

            {/* Technical */}
            <Section title="⚙️ Technical SEO">
              <Row label="HTTPS" value={result.technical?.https ? '✅ Yes' : '❌ No'} />
              <Row label="robots.txt" value={result.technical?.robots ? '✅ Found' : '❌ Missing'} />
              <Row label="sitemap.xml" value={result.technical?.sitemap ? '✅ Found' : '❌ Missing'} />
              <Row label="Load Time" value={result.technical?.loadTime + 'ms'} />
              <Row label="Page Size" value={result.technical?.pageSize + ' KB'} />
            </Section>

            {/* Recommendations */}
            {result.recommendations?.length > 0 && (
              <Section title="💡 Recommendations">
                {result.recommendations.map((r, i) => (
                  <div key={i} style={{ color: '#f39c12', padding: '6px 0', borderBottom: '1px solid #222', fontSize: '0.9rem' }}>
                    ⚠️ {r}
                  </div>
                ))}
              </Section>
            )}
          </div>
        )}

        {result?.error && (
          <div style={{ ...cardStyle, marginTop: '1.5rem', borderColor: '#e74c3c' }}>
            <p style={{ color: '#e74c3c' }}>❌ {result.error}</p>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div style={{ ...cardStyle, marginTop: '1.5rem' }}>
            <h3 style={{ color: '#aaa', marginBottom: '1rem' }}>🕐 Recent Scans</h3>
            {history.map((h, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #222', fontSize: '0.85rem' }}>
                <span style={{ color: '#6c63ff' }}>{h.url}</span>
                <span style={{ color: '#2ecc71' }}>Score: {h.score}</span>
                <span style={{ color: '#555' }}>{new Date(h.date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Helper Components
const ScoreCard = ({ label, value, color }) => (
  <div style={{ background: '#0f0c29', border: `2px solid ${color}`, borderRadius: '12px', padding: '1rem', flex: '1', minWidth: '100px', textAlign: 'center' }}>
    <div style={{ fontSize: '2rem', fontWeight: 'bold', color }}>{value}</div>
    <div style={{ color: '#aaa', fontSize: '0.8rem' }}>{label}</div>
  </div>
)

const Section = ({ title, children }) => (
  <div style={{ marginBottom: '1.5rem' }}>
    <h4 style={{ color: '#aaa', marginBottom: '0.5rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>{title}</h4>
    {children}
  </div>
)

const Row = ({ label, value }) => (
  <div style={{ display: 'flex', gap: '1rem', padding: '6px 0', fontSize: '0.85rem' }}>
    <span style={{ color: '#6c63ff', minWidth: '130px' }}>{label}:</span>
    <span style={{ color: '#ddd', wordBreak: 'break-all' }}>{value || '—'}</span>
  </div>
)

const cardStyle = {
  background: '#1a1a2e',
  borderRadius: '12px',
  padding: '1.5rem',
  border: '1px solid #333'
}
const inputStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: '8px',
  border: '1px solid #444',
  background: '#0f0c29',
  color: '#fff',
  fontSize: '0.9rem',
  boxSizing: 'border-box'
}
const smallBtn = {
  padding: '6px 14px',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '0.85rem'
            }
