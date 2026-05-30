'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [data, setData] = useState({ users: [], stats: {} })
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const u = localStorage.getItem('user')
    if (!u) return router.push('/login')
    const parsed = JSON.parse(u)
    if (parsed.role !== 'admin') return router.push('/dashboard')
    setUser(parsed)
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const d = await res.json()
      setData(d)
    } catch {}
    setLoading(false)
  }

  const banUser = async (userId) => {
    await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ action: 'banUser', userId })
    })
    fetchData()
  }

  if (loading) return (
    <div style={{ background: '#020008', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e74c3c' }}>
      Loading admin panel...
    </div>
  )

  const filteredUsers = data.users?.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const tabs = ['overview', 'users', 'logs']

  return (
    <div style={{ minHeight: '100vh', background: '#020008', color: '#fff', fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Topbar */}
      <div style={{ background: 'rgba(231,76,60,0.05)', borderBottom: '1px solid rgba(231,76,60,0.15)', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.3rem' }}>🛡️</span>
          <span style={{ fontWeight: 800, color: '#e74c3c', fontSize: '1.1rem' }}>Admin Panel</span>
          <span style={{ background: 'rgba(231,76,60,0.15)', color: '#e74c3c', fontSize: '0.7rem', padding: '2px 8px', borderRadius: 4 }}>RESTRICTED</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => router.push('/dashboard')} style={{ padding: '6px 14px', background: 'rgba(108,99,255,0.15)', color: '#6c63ff', border: '1px solid rgba(108,99,255,0.3)', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem' }}>Dashboard</button>
          <button onClick={() => { localStorage.clear(); router.push('/') }} style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.04)', color: '#555', border: '1px solid #222', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem' }}>Logout</button>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1rem' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Users', value: data.stats?.totalUsers || 0, color: '#6c63ff', icon: '👥' },
            { label: 'Total Scans', value: data.stats?.totalScans || 0, color: '#2ecc71', icon: '🔍' },
            { label: 'Active Today', value: data.stats?.activeToday || 0, color: '#f39c12', icon: '⚡' },
            { label: 'Banned Users', value: data.stats?.bannedUsers || 0, color: '#e74c3c', icon: '🚫' },
          ].map((s, i) => (
            <div key={i} style={{ background: `${s.color}08`, border: `1px solid ${s.color}25`, borderRadius: 14, padding: '1.2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ color: '#444', fontSize: '0.8rem', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '8px 18px', background: tab === t ? 'rgba(231,76,60,0.2)' : 'rgba(255,255,255,0.02)', color: tab === t ? '#e74c3c' : '#444', border: `1px solid ${tab === t ? 'rgba(231,76,60,0.4)' : '#111'}`, borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem', fontWeight: tab === t ? 700 : 400, textTransform: 'capitalize', transition: 'all 0.2s' }}>
              {t === 'overview' ? '📊 Overview' : t === 'users' ? '👥 Users' : '📝 Logs'}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(231,76,60,0.1)', borderRadius: 16, padding: '1.5rem' }}>
            <h3 style={{ color: '#e74c3c', marginBottom: '1rem' }}>📊 System Status</h3>
            {[
              { k: 'Server Status', v: '🟢 Online' },
              { k: 'Database', v: '🟢 Supabase Connected' },
              { k: 'API Calls Today', v: data.stats?.apiCalls || 0 },
              { k: 'Average SEO Score', v: `${data.stats?.avgScore || 0}/100` },
              { k: 'Top Scanned Domain', v: data.stats?.topDomain || 'N/A' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', padding: '10px 0', borderBottom: '1px solid #0a0a0a', fontSize: '0.9rem' }}>
                <span style={{ color: '#444', minWidth: 200 }}>{r.k}</span>
                <span style={{ color: '#bbb' }}>{r.v}</span>
              </div>
            ))}
          </div>
        )}

        {/* Users Tab */}
        {tab === 'users' && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(231,76,60,0.1)', borderRadius: 16, padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: '#e74c3c' }}>👥 All Users ({filteredUsers?.length})</h3>
              <input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid #222', borderRadius: 8, color: '#fff', fontSize: '0.85rem', outline: 'none', width: 180 }} />
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ color: '#333', borderBottom: '1px solid #111' }}>
                    {['Name', 'Email', 'Role', 'Scans', 'Status', 'Action'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 8px', fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers?.map((u, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #0a0a0a' }}>
                      <td style={{ padding: '12px 8px', color: '#ddd' }}>{u.name}</td>
                      <td style={{ padding: '12px 8px', color: '#666' }}>{u.email}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <span style={{ background: u.role === 'admin' ? 'rgba(231,76,60,0.15)' : 'rgba(108,99,255,0.15)', color: u.role === 'admin' ? '#e74c3c' : '#6c63ff', padding: '2px 10px', borderRadius: 20, fontSize: '0.75rem' }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px', color: '#555' }}>{u.scans || 0}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <span style={{ color: u.banned ? '#e74c3c' : '#2ecc71', fontSize: '0.8rem' }}>
                          {u.banned ? '🚫 Banned' : '✅ Active'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        {u.role !== 'admin' && (
                          <button onClick={() => banUser(u.id)}
                            style={{ padding: '4px 12px', background: u.banned ? 'rgba(46,204,113,0.15)' : 'rgba(231,76,60,0.15)', color: u.banned ? '#2ecc71' : '#e74c3c', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: '0.75rem' }}>
                            {u.banned ? 'Unban' : 'Ban'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {tab === 'logs' && (
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(231,76,60,0.1)', borderRadius: 16, padding: '1.5rem' }}>
            <h3 style={{ color: '#e74c3c', marginBottom: '1rem' }}>📝 Activity Logs</h3>
            {data.stats?.logs?.length > 0 ? data.stats.logs.map((log, i) => (
              <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid #0a0a0a', fontSize: '0.82rem', display: 'flex', gap: 10 }}>
                <span style={{ color: '#333', flexShrink: 0 }}>[{log.time}]</span>
                <span style={{ color: '#555' }}>{log.message}</span>
              </div>
            )) : (
              <p style={{ color: '#222', textAlign: 'center', padding: '2rem' }}>Koi logs nahi hain</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
        }
