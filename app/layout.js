import './globals.css'

export const metadata = {
  title: 'XYNTRA AI // Agency OS',
  description: 'Enterprise Multi-Agent Autonomous Operating System',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#05050a] text-[#00ffcc] font-mono min-h-screen selection:bg-[#00ffcc] selection:text-black">
        {children}
      </body>
    </html>
  )
    }
