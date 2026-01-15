import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Doormedexpress - Your Health, Delivered. Hassle-Free.',
  description: 'Subscription-based online pharmacy delivering maintenance medications and supplements directly to your door.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
