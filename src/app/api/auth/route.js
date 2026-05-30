// src/app/api/auth/route.js
import { NextResponse } from 'next/server'

// Simple in-memory DB (replace with real DB like MongoDB/Prisma)
const users = [
  { id: '1', name: 'Admin User', email: 'admin@seo.com', password: 'admin123', role: 'admin', scans: 42, banned: false },
  { id: '2', name: 'Test User', email: 'user@seo.com', password: 'user123', role: 'user', scans: 8, banned: false },
]

// Simple token generator (use JWT in production)
const generateToken = (userId) => {
  return Buffer.from(`${userId}:${Date.now()}:seo-audit-secret`).toString('base64')
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { action, email, password, name } = body

    if (action === 'login') {
      const user = users.find(u => u.email === email && u.password === password)
      if (!user) {
        return NextResponse.json({ success: false, message: 'Invalid email or password' })
      }
      if (user.banned) {
        return NextResponse.json({ success: false, message: 'Your account has been banned' })
      }
      const token = generateToken(user.id)
      const { password: _, ...safeUser } = user
      return NextResponse.json({ success: true, user: safeUser, token })
    }

    if (action === 'signup') {
      if (!name || !email || !password) {
        return NextResponse.json({ success: false, message: 'All fields required' })
      }
      if (users.find(u => u.email === email)) {
        return NextResponse.json({ success: false, message: 'Email already registered' })
      }
      if (password.length < 6) {
        return NextResponse.json({ success: false, message: 'Password must be 6+ characters' })
      }
      const newUser = {
        id: String(users.length + 1),
        name, email, password,
        role: 'user',
        scans: 0,
        banned: false
      }
      users.push(newUser)
      const token = generateToken(newUser.id)
      const { password: _, ...safeUser } = newUser
      return NextResponse.json({ success: true, user: safeUser, token })
    }

    return NextResponse.json({ success: false, message: 'Invalid action' })
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
