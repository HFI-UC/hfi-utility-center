import "./globals.css"
import { Geist_Mono, Inter } from "next/font/google"

import { Providers } from "@/app/providers"
import { Navbar } from "@/components/navbar"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body>
        <Providers>
          <Navbar>{children}</Navbar>
        </Providers>
      </body>
    </html>
  )
}

export const metadata = {
  title: "HFI Utility Center",
  description: "HFI campus space reservation and administration platform",
}
