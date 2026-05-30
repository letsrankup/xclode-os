// src/app/page.js
'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) setUser(JSON.parse(stored))
  }, [])

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontFamily: 'monospace'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
        🔍 SEO Audit Pro
      </h1>
      <p style={{ color: '#aaa', marginBottom: '2rem' }}>
        Deep website analysis, scraping & ranking tool
      </p>

      <div style={{ display: 'flex', gap: '1rem' }}>
        {user ? (
          <>
            <button onClick={() => router.push('/dashboard')}
              style={btnStyle('#6c63ff')}>
              Dashboard
            </button>
            {user.role === 'admin' && (
              <button onClick={() => router.push('/admin')}
                style={btnStyle('#e74c3c')}>
                Admin Panel
              </button>
            )}
          </>
        ) : (
          <>
            <button onClick={() => router.push('/login')}
              style={btnStyle('#6c63ff')}>
              Login
            </button>
            <button onClick={() => router.push('/signup')}
              style={btnStyle('#2ecc71')}>
              Sign Up
            </button>
          </>
        )}
      </div>
    </main>
  )
}

const btnStyle = (bg) => ({
  padding: '12px 28px',
  background: bg,
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '1rem',
  fontWeight: 'bold'
})
