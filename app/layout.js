import './globals.css'

export const metadata = {
  title: 'XcloDE — SEO Audit Pro',
  description: 'Most powerful SEO tool',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: '#020008' }}>
        {children}
      </body>
    </html>
  )
}
