import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(request) {
  const auth = request.headers.get('authorization')
  if (!auth?.startsWith('Bearer '))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()
    if (error) throw error

    const formatted = users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.user_metadata?.name || u.email?.split('@')[0],
      role: u.user_metadata?.role || 'user',
      scans: u.user_metadata?.scans || 0,
      banned: !!u.banned_until,
      createdAt: u.created_at
    }))

    const logs = [
      { time: new Date().toLocaleTimeString(), message: `Admin panel accessed` },
      ...formatted.slice(0, 5).map(u => ({ time: '—', message: `User ${u.email} — ${u.scans} scans` }))
    ]

    return NextResponse.json({
      users: formatted,
      stats: {
        totalUsers: formatted.length,
        totalScans: formatted.reduce((a, u) => a + u.scans, 0),
        activeToday: Math.ceil(formatted.length * 0.5),
        bannedUsers: formatted.filter(u => u.banned).length,
        apiCalls: formatted.reduce((a, u) => a + u.scans, 0) * 3,
        avgScore: 74,
        topDomain: 'N/A',
        logs
      }
    })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(request) {
  const auth = request.headers.get('authorization')
  if (!auth?.startsWith('Bearer '))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { action, userId } = await request.json()

    if (action === 'banUser') {
      const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId)
      const isBanned = !!user?.user?.banned_until

      await supabaseAdmin.auth.admin.updateUserById(userId, {
        ban_duration: isBanned ? 'none' : '876600h'
      })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, message: 'Unknown action' })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
                                      }
