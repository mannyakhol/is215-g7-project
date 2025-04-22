import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { NavHeader } from "@/components/nav-header"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "IS215 Group 7 Project",
  description: "A project for generating articles from images using ChatGPT",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NavHeader />
          <main className="min-h-[calc(100vh-4rem)] px-4 md:px-6">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
