import type React from "react"
import type { Metadata } from "next"
import { Risque } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import AnimatedBackground from "@/components/animated-background"
import { Providers } from "@/components/providers"

const risque = Risque({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-risque",
})

export const metadata: Metadata = {
  title: "LeipPass - Coming Soon",
  description: "Unlocking a new era",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${risque.variable}`}>
        <Providers>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <AnimatedBackground />
            <ThemeToggle />
            {children}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}



import './globals.css'