// src/middleware.js
import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl

  // Protected routes - check token exists
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    // In production, verify JWT here
    // For now just pass through (client-side handles redirect)
    return NextResponse.next()
  }

  // API rate limiting headers
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Limit', '100')
    response.headers.set('X-RateLimit-Window', '1h')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/api/:path*']
}
