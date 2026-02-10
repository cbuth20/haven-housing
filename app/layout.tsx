import type { Metadata } from 'next'
import './globals.css'
import { LayoutWrapper } from '@/components/layout/LayoutWrapper'

export const metadata: Metadata = {
  title: 'Haven Housing Solutions',
  description: 'Professional property management and relocation services',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-body antialiased">
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  )
}
