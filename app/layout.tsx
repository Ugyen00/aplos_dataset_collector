import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dzongkha TTS Recorder',
  description: 'Voice recording platform for Dzongkha TTS dataset — Aplos Lab',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="dz">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+Tibetan:wght@400;600&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
