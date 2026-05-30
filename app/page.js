'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const u = localStorage.getItem('user')
    if (u) setUser(JSON.parse(u))
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const features = [
    { icon: '🔍', title: 'Deep SEO Analysis', desc: 'Title, meta, headers, canonical, robots, sitemap — sab kuch ek jagah' },
    { icon: '🌐', title: '200+ Data Points', desc: 'Links, images, scripts, load time, page size — complete audit' },
    { icon: '🕵️', title: 'User Agent Spoofing', desc: 'Chrome, Firefox, Googlebot — kisi bhi agent se scan karo' },
    { icon: '⚡', title: 'Real-Time Scoring', desc: 'SEO, Performance, Security, Mobile — live score with fixes' },
    { icon: '🛡️', title: 'Security Audit', desc: 'HTTPS, headers, vulnerabilities detect karo instantly' },
    { icon: '📊', title: 'Competitor Analysis', desc: 'Apni site ko competitors se compare karo' },
  ]

  const stats = [
    { value: '200+', label: 'Data Points' },
    { value: '99%', label: 'Accuracy' },
    { value: '10s', label: 'Scan Time' },
    { value: '24/7', label: 'Available' },
  ]

  return (
    <div style={{ background: '#020008', color: '#fff', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", overflowX: 'hidden' }}>

      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '1rem 2rem',
        background: scrolled ? 'rgba(2,0,8,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(108,99,255,0.2)' : 'none',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        transition: 'all 0.3s'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #6c63ff, #a855f7)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🔍</div>
          <span style={{ fontWeight: 800, fontSize: '1.2rem', background: 'linear-gradient(90deg, #6c63ff, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>XcloDE</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {user ? (
            <>
              <button onClick={() => router.push('/dashboard')} style={navBtn('#6c63ff')}>Dashboard</button>
              {user.role === 'admin' && <button onClick={() => router.push('/admin')} style={navBtn('#e74c3c')}>Admin</button>}
            </>
          ) : (
            <>
              <button onClick={() => router.push('/login')} style={{ background: 'transparent', color: '#aaa', border: '1px solid #333', padding: '8px 20px', borderRadius: 8, cursor: 'pointer', fontSize: '0.9rem' }}>Login</button>
              <button onClick={() => router.push('/signup')} style={navBtn('#6c63ff')}>Get Started</button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '6rem 1rem 4rem', position: 'relative' }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 800, position: 'relative' }}>
          <div style={{ display: 'inline-block', background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.4)', borderRadius: 50, padding: '6px 18px', fontSize: '0.8rem', color: '#a78bfa', marginBottom: '1.5rem', letterSpacing: 1 }}>
            🚀 MOST POWERFUL SEO TOOL
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.5rem' }}>
            Rank Higher.<br />
            <span style={{ background: 'linear-gradient(135deg, #6c63ff, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Beat Competitors.
            </span><br />
            Dominate Google.
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#888', marginBottom: '2.5rem', maxWidth: 550, margin: '0 auto 2.5rem' }}>
            200+ data points ka deep scan. Real-time SEO scoring. Competitor analysis. Sab kuch ek powerful dashboard mein.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => router.push(user ? '/dashboard' : '/signup')}
              style={{ padding: '14px 36px', background: 'linear-gradient(135deg, #6c63ff, #a855f7)', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: '1rem', fontWeight: 700, boxShadow: '0 0 30px rgba(108,99,255,0.4)' }}>
              {user ? 'Go to Dashboard →' : 'Start Free Scan →'}
            </button>
            <button onClick={() => router.push('/login')}
              style={{ padding: '14px 36px', background: 'transparent', color: '#aaa', border: '1px solid #333', borderRadius: 12, cursor: 'pointer', fontSize: '1rem' }}>
              View Demo
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '3rem 1rem', borderTop: '1px solid #111', borderBottom: '1px solid #111' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', textAlign: 'center' }}>
          {stats.map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, background: 'linear-gradient(135deg, #6c63ff, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
              <div style={{ color: '#555', fontSize: '0.85rem', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '5rem 1rem', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Kyu choose karo <span style={{ background: 'linear-gradient(135deg, #6c63ff, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>XcloDE?</span></h2>
          <p style={{ color: '#555', marginTop: 10 }}>Har cheez jo aapko chahiye apni website top pe laane ke liye</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {features.map((f, i) => (
            <div key={i} style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.05), rgba(168,85,247,0.05))', border: '1px solid rgba(108,99,255,0.15)', borderRadius: 16, padding: '1.5rem', transition: 'all 0.3s', cursor: 'default' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(108,99,255,0.5)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(108,99,255,0.15)'}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '5rem 1rem', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', background: 'linear-gradient(135deg, rgba(108,99,255,0.1), rgba(168,85,247,0.1))', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 24, padding: '3rem 2rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Aaj hi shuru karo</h2>
          <p style={{ color: '#666', marginBottom: '2rem' }}>Free mein scan karo aur dekho aapki site kahan khadi hai</p>
          <button onClick={() => router.push('/signup')}
            style={{ padding: '14px 40px', background: 'linear-gradient(135deg, #6c63ff, #a855f7)', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: '1rem', fontWeight: 700 }}>
            Free Mein Start Karo →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #111', padding: '2rem', textAlign: 'center', color: '#333', fontSize: '0.85rem' }}>
        © 2026 XcloDE — Built for Domination
      </footer>
    </div>
  )
}

const navBtn = (bg) => ({
  padding: '8px 20px', background: bg, color: '#fff', border: 'none',
  borderRadius: 8, cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600
})
