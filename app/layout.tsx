import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { MainLayout } from "@/components/main-layout"
import { ApiInitializer } from "@/components/api-initializer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "EPI-USE Data Platform",
  description: "Comprehensive data mapping, transformation, and quality management platform",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MainLayout>{children}</MainLayout>
        <ApiInitializer />
      </body>
    </html>
  )
}
