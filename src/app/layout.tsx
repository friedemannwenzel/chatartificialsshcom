import { type Metadata } from 'next'
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
} from '@clerk/nextjs'
import { Inter, Geist_Mono } from 'next/font/google'
import './globals.css'
import ConvexClientProvider from '@/components/ConvexClientProvider'
import { SidebarLayout } from '@/components/SidebarLayout'
import { ThemeProvider } from "@/components/theme-provider"
import { SecurityProvider } from "@/components/SecurityProvider"

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'ArtificialSSH Chat',
  description: 'Modern AI chat application featuring multiple providers, beautiful UI, and comprehensive rate limiting - chat.artificialssh.com',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} ${geistMono.variable} antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
          <ConvexClientProvider>
            <SecurityProvider>
              <SignedIn>
                <SidebarLayout>
                  {children}
                </SidebarLayout>
              </SignedIn>
              <SignedOut>
                {children}
              </SignedOut>
            </SecurityProvider>
          </ConvexClientProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}