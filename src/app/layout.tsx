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
import { MiniKitContextProvider } from '@/components/MiniKitProvider'
import { MiniKitWrapper } from '@/components/MiniKitWrapper'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
  return {
    title: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || 'ArtificialSSH Chat',
    description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Modern AI chat application featuring multiple providers, beautiful UI, and comprehensive rate limiting - chat.artificialssh.com',
    other: {
      "fc:frame": JSON.stringify({
        version: "next",
        imageUrl: process.env.NEXT_PUBLIC_APP_HERO_IMAGE || `${baseUrl}/hero.svg`,
        button: {
          title: `Launch ${process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || 'ArtificialSSH Chat'}`,
          action: {
            type: "launch_frame",
            name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || 'ArtificialSSH Chat',
            url: baseUrl,
            splashImageUrl: process.env.NEXT_PUBLIC_APP_SPLASH_IMAGE || `${baseUrl}/splash.svg`,
            splashBackgroundColor: process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR || '#151515',
          },
        },
      }),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark" suppressHydrationWarning>
        <body className={`${inter.variable} ${geistMono.variable} antialiased`}>
          <MiniKitContextProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              forcedTheme="dark"
              enableSystem={false}
              disableTransitionOnChange
            >
            <ConvexClientProvider>
              <SecurityProvider>
                <MiniKitWrapper>
                  <SignedIn>
                    <SidebarLayout>
                      {children}
                    </SidebarLayout>
                  </SignedIn>
                  <SignedOut>
                    {children}
                  </SignedOut>
                </MiniKitWrapper>
              </SecurityProvider>
            </ConvexClientProvider>
            </ThemeProvider>
          </MiniKitContextProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}