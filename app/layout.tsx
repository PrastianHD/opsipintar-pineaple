import type { Metadata } from 'next'
import { Fraunces, DM_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { AppProvider } from '@/lib/context'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  axes: ['SOFT', 'WONK', 'opsz'],
  display: 'swap',
})
const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})
const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'PromptCraft — Studio UGC AI untuk Brand Indonesia',
  description:
    'Studio konten UGC otomatis. Dari link Shopee ke prompt video Veo3, dalam 90 detik. Dibuat di Indonesia.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning className={`${fraunces.variable} ${dmSans.variable} ${mono.variable}`}>
      <body suppressHydrationWarning>
        <a href="#main" className="skip-link">Lewati ke konten utama</a>
        <ThemeProvider>
          <AppProvider>
            <div id="main">{children}</div>
            <Toaster position="top-center" richColors />
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
