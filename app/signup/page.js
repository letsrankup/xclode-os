'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false)

  const handleSignup = async () => {
    if (!form.name || !form.email || !form.password) return setError('Sab fields bharein')
    if (form.password.length < 6) return setError('Password kam az kam 6 characters ka ho')
    setLoading(true); setError('')
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
      } else setError(data.message)
    } catch { setError('Server error') }
    setLoading(false)
  }

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3
  const strengthColor = ['#333', '#e74c3c', '#f39c12', '#2ecc71'][strength]
  const strengthLabel = ['', 'Weak', 'Medium', 'Strong'][strength]

  return (
    <div style={{ minHeight: '100vh', background: '#020008', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', width: 500, height: 500, background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 420, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 20, padding: '2.5rem', backdropFilter: 'blur(20px)', position: 'relative' }}>

        <div onClick={() => router.push('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '2rem', cursor: 'pointer' }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #6c63ff, #a855f7)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🔍</div>
          <span style={{ fontWeight: 800, background: 'linear-gradient(90deg, #6c63ff, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>XcloDE</span>
        </div>

        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: 6 }}>Account banao ✨</h1>
        <p style={{ color: '#555', fontSize: '0.9rem', marginBottom: '2rem' }}>Free mein shuru karo, koi credit card nahi</p>

        {['name', 'email', 'password'].map((field) => (
          <div key={field} style={{ marginBottom: '1rem' }}>
            <label style={{ color: '#666', fontSize: '0.8rem', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>
              {field === 'name' ? 'Aapka Naam' : field === 'email' ? 'Email' : 'Password'}
            </label>
            {field === 'password' ? (
              <>
                <div style={{ position: 'relative' }}>
                  <input type={show ? 'text' : 'password'} placeholder="••••••••" value={form.password}
                    onChange={e => setForm({...form, password: e.target.value})}
                    style={{ ...inputStyle, paddingRight: 40 }} />
                  <span onClick={() => setShow(!show)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#555' }}>
                    {show ? '🙈' : '👁️'}
                  </span>
                </div>
                {form.password && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    <div style={{ flex: 1, height: 3, background: '#111', borderRadius: 2 }}>
                      <div style={{ width: `${(strength / 3) * 100}%`, height: '100%', background: strengthColor, borderRadius: 2, transition: 'all 0.3s' }} />
                    </div>
                    <span style={{ color: strengthColor, fontSize: '0.75rem' }}>{strengthLabel}</span>
                  </div>
                )}
              </>
            ) : (
              <input type={field === 'email' ? 'email' : 'text'}
                placeholder={field === 'name' ? 'Ali Hassan' : 'aap@example.com'}
                value={form[field]}
                onChange={e => setForm({...form, [field]: e.target.value})}
                style={inputStyle} />
            )}
          </div>
        ))}

        {error && (
          <div style={{ background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: 8, padding: '10px 14px', color: '#e74c3c', fontSize: '0.85rem', marginBottom: '1rem' }}>
            ⚠️ {error}
          </div>
        )}

        <button onClick={handleSignup} disabled={loading}
          style={{ width: '100%', padding: '13px', background: loading ? '#333' : 'linear-gradient(135deg, #6c63ff, #a855f7)', color: '#fff', border: 'none', borderRadius: 12, cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1rem', fontWeight: 700, marginTop: 8 }}>
          {loading ? '⏳ Account ban raha hai...' : 'Account Banao →'}
        </button>

        <p style={{ textAlign: 'center', color: '#444', fontSize: '0.85rem', marginTop: '1.5rem' }}>
          Pehle se account hai?{' '}
          <span onClick={() => router.push('/login')} style={{ color: '#a855f7', cursor: 'pointer', fontWeight: 600 }}>Login karo</span>
        </p>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '12px 14px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10, color: '#fff', fontSize: '0.95rem',
  outline: 'none', boxSizing: 'border-box'
}
