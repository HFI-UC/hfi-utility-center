import "./globals.css"
import { Inter } from "next/font/google"
import { Providers } from "@/app/providers"
import { Navbar } from "@/components/navbar"
import { getLocale } from "next-intl/server"
import enMessages from "@/messages/en-US.json"
import zhMessages from "@/messages/zh-CN.json"
import { appLocale } from "@/i18n/config"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = appLocale(await getLocale())
  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${inter.variable} font-sans antialiased`}
    >
      <body>
        <Providers
          initialLocale={locale}
          messages={{ "zh-CN": zhMessages, "en-US": enMessages }}
        >
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
