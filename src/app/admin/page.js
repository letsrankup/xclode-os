// src/app/admin/page.js
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (!stored) return router.push('/login')
    const u = JSON.parse(stored)
    if (u.role !== 'admin') return router.push('/dashboard')
    setUser(u)
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      const res = await fetch('/api/admin', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await res.json()
      setUsers(data.users || [])
      setStats(data.stats || {})
    } catch (e) {}
    setLoading(false)
  }

  const banUser = async (userId) => {
    await fetch('/api/admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ action: 'banUser', userId })
    })
    fetchAdminData()
  }

  if (loading) return <div style={{ background: '#0f0c29', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Loading...</div>

  return (
    <div style={{ minHeight: '100vh', background: '#0f0c29', color: '#fff', fontFamily: 'monospace' }}>
      {/* Navbar */}
      <nav style={{ background: '#1a0000', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #500' }}>
        <span style={{ color: '#e74c3c', fontWeight: 'bold', fontSize: '1.2rem' }}>🛡️ Admin Panel</span>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => router.push('/dashboard')} style={{ ...smallBtn, background: '#6c63ff' }}>Dashboard</button>
          <button onClick={() => { localStorage.clear(); router.push('/') }} style={{ ...smallBtn, background: '#555' }}>Logout</button>
        </div>
      </nav>

      <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem' }}>
        {/* Stats Cards */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <StatCard label="Total Users" value={stats?.totalUsers || 0} color="#6c63ff" />
          <StatCard label="Total Scans" value={stats?.totalScans || 0} color="#2ecc71" />
          <StatCard label="Active Today" value={stats?.activeToday || 0} color="#f39c12" />
          <StatCard label="Banned Users" value={stats?.bannedUsers || 0} color="#e74c3c" />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {['overview', 'users', 'logs'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: '8px 18px', background: tab === t ? '#e74c3c' : '#1a1a2e', color: '#fff', border: '1px solid #500', borderRadius: '6px', cursor: 'pointer', textTransform: 'capitalize' }}>
              {t}
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {tab === 'users' && (
          <div style={cardStyle}>
            <h3 style={{ color: '#e74c3c', marginBottom: '1rem' }}>👥 All Users</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ color: '#aaa', borderBottom: '1px solid #333' }}>
                  <th style={th}>Name</th>
                  <th style={th}>Email</th>
                  <th style={th}>Role</th>
                  <th style={th}>Scans</th>
                  <th style={th}>Status</th>
                  <th style={th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #222' }}>
                    <td style={td}>{u.name}</td>
                    <td style={td}>{u.email}</td>
                    <td style={td}><span style={{ color: u.role === 'admin' ? '#e74c3c' : '#6c63ff' }}>{u.role}</span></td>
                    <td style={td}>{u.scans || 0}</td>
                    <td style={td}><span style={{ color: u.banned ? '#e74c3c' : '#2ecc71' }}>{u.banned ? 'Banned' : 'Active'}</span></td>
                    <td style={td}>
                      {u.role !== 'admin' && (
                        <button onClick={() => banUser(u.id)}
                          style={{ padding: '4px 10px', background: u.banned ? '#2ecc71' : '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>
                          {u.banned ? 'Unban' : 'Ban'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Overview Tab */}
        {tab === 'overview' && (
          <div style={cardStyle}>
            <h3 style={{ color: '#e74c3c', marginBottom: '1rem' }}>📈 System Overview</h3>
            <Row label="Server Status" value="🟢 Online" />
            <Row label="Database" value="🟢 Connected" />
            <Row label="API Calls Today" value={stats?.apiCalls || 0} />
            <Row label="Avg SEO Score" value={stats?.avgScore || 0} />
            <Row label="Top Scanned Domain" value={stats?.topDomain || 'N/A'} />
          </div>
        )}

        {/* Logs Tab */}
        {tab === 'logs' && (
          <div style={cardStyle}>
            <h3 style={{ color: '#e74c3c', marginBottom: '1rem' }}>📝 Recent Activity</h3>
            {(stats?.logs || []).map((log, i) => (
              <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid #222', fontSize: '0.8rem', color: '#aaa' }}>
                <span style={{ color: '#6c63ff' }}>[{log.time}]</span> {log.message}
              </div>
            ))}
            {(!stats?.logs || stats.logs.length === 0) && <p style={{ color: '#555' }}>No logs yet</p>}
          </div>
        )}
      </div>
    </div>
  )
}

const StatCard = ({ label, value, color }) => (
  <div style={{ background: '#1a1a2e', border: `1px solid ${color}`, borderRadius: '12px', padding: '1.2rem', flex: '1', minWidth: '120px', textAlign: 'center' }}>
    <div style={{ fontSize: '2rem', fontWeight: 'bold', color }}>{value}</div>
    <div style={{ color: '#aaa', fontSize: '0.8rem' }}>{label}</div>
  </div>
)

const Row = ({ label, value }) => (
  <div style={{ display: 'flex', gap: '1rem', padding: '8px 0', fontSize: '0.9rem', borderBottom: '1px solid #222' }}>
    <span style={{ color: '#e74c3c', minWidth: '180px' }}>{label}:</span>
    <span style={{ color: '#ddd' }}>{value}</span>
  </div>
)

const cardStyle = { background: '#1a1a2e', borderRadius: '12px', padding: '1.5rem', border: '1px solid #500' }
const smallBtn = { padding: '6px 14px', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }
const th = { textAlign: 'left', padding: '8px', fontWeight: 'normal' }
const td = { padding: '10px 8px', color: '#ddd' }
