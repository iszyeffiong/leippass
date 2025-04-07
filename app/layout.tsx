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
  icons: {
    icon: "/images/leippass-logo.png",
    apple: "/images/leippass-logo.png",
  },
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
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange={false}>
            <AnimatedBackground />
            <ThemeToggle />
            <div className="min-h-screen">{children}</div>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}

