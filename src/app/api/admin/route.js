// src/app/api/admin/route.js
import { NextResponse } from 'next/server'

// Shared mock DB (in production use real DB)
const users = [
  { id: '1', name: 'Admin User', email: 'admin@seo.com', role: 'admin', scans: 42, banned: false },
  { id: '2', name: 'Test User', email: 'user@seo.com', role: 'user', scans: 8, banned: false },
  { id: '3', name: 'John Doe', email: 'john@example.com', role: 'user', scans: 15, banned: false },
]

const logs = [
  { time: '10:32 AM', message: 'User john@example.com scanned google.com - Score: 87' },
  { time: '09:15 AM', message: 'New user registered: john@example.com' },
  { time: '08:45 AM', message: 'Admin login from 192.168.1.1' },
]

// Simple auth check (use JWT in production)
const isAdmin = (request) => {
  const auth = request.headers.get('authorization')
  return auth && auth.includes('Bearer ')
}

export async function GET(request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const bannedCount = users.filter(u => u.banned).length
  const totalScans = users.reduce((acc, u) => acc + u.scans, 0)

  return NextResponse.json({
    users,
    stats: {
      totalUsers: users.length,
      totalScans,
      activeToday: Math.floor(users.length * 0.6),
      bannedUsers: bannedCount,
      apiCalls: totalScans * 3,
      avgScore: 74,
      topDomain: 'google.com',
      logs
    }
  })
}

export async function POST(request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { action, userId } = body

  if (action === 'banUser') {
    const user = users.find(u => u.id === userId)
    if (user) {
      user.banned = !user.banned
      logs.unshift({ time: new Date().toLocaleTimeString(), message: `User ${user.email} ${user.banned ? 'banned' : 'unbanned'} by admin` })
    }
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ success: false, message: 'Unknown action' })
      }
