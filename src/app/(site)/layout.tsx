import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  title: 'Web Creator',
  description: 'A shared-runtime CMS prototype built with Next.js and Payload.'
}

export default function SiteLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
