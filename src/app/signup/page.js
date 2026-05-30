// src/app/signup/page.js
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'signup', ...form })
      })
      const data = await res.json()
      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('token', data.token)
        router.push('/dashboard')
      } else {
        setError(data.message || 'Signup failed')
      }
    } catch (e) {
      setError('Server error')
    }
    setLoading(false)
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h2 style={{ color: '#2ecc71', marginBottom: '1.5rem' }}>✨ Sign Up</h2>

        <input
          placeholder="Full Name"
          value={form.name}
          onChange={e => setForm({...form, name: e.target.value})}
          style={inputStyle}
        />
        <input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={e => setForm({...form, email: e.target.value})}
          style={inputStyle}
        />
        <input
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={e => setForm({...form, password: e.target.value})}
          style={inputStyle}
        />

        {error && <p style={{ color: '#e74c3c', fontSize: '0.85rem' }}>{error}</p>}

        <button onClick={handleSignup} disabled={loading} style={btnStyle}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>

        <p style={{ color: '#aaa', marginTop: '1rem', fontSize: '0.85rem' }}>
          Already have account?{' '}
          <span onClick={() => router.push('/login')}
            style={{ color: '#2ecc71', cursor: 'pointer' }}>
            Login
          </span>
        </p>
      </div>
    </div>
  )
}

const pageStyle = {
  minHeight: '100vh',
  background: '#0f0c29',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}
const cardStyle = {
  background: '#1a1a2e',
  padding: '2.5rem',
  borderRadius: '16px',
  width: '360px',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  border: '1px solid #333'
}
const inputStyle = {
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid #444',
  background: '#0f0c29',
  color: '#fff',
  fontSize: '1rem'
}
const btnStyle = {
  padding: '12px',
  background: '#2ecc71',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '1rem'
            }
