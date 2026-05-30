import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(request) {
  try {
    const { action, email, password, name } = await request.json()

    if (action === 'signup') {
      if (!name || !email || !password)
        return NextResponse.json({ success: false, message: 'Sab fields bharein' })
      if (password.length < 6)
        return NextResponse.json({ success: false, message: 'Password 6+ characters ka hona chahiye' })

      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { name, role: 'user', scans: 0 } }
      })
      if (error) return NextResponse.json({ success: false, message: error.message })
      return NextResponse.json({
        success: true,
        user: { id: data.user?.id, email, name, role: 'user' },
        token: data.session?.access_token || 'pending-email-confirm'
      })
    }

    if (action === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return NextResponse.json({ success: false, message: 'Email ya password galat hai' })
      const meta = data.user.user_metadata
      return NextResponse.json({
        success: true,
        user: { id: data.user.id, email: data.user.email, name: meta?.name || email, role: meta?.role || 'user' },
        token: data.session.access_token
      })
    }

    return NextResponse.json({ success: false, message: 'Invalid action' })
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Server error: ' + e.message }, { status: 500 })
  }
        }
