import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AppShell } from "@/components/app-shell"
import { LocaleProvider } from "@/components/locale-provider"
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
        <LocaleProvider
          initialLocale={locale}
          messages={{ "zh-CN": zhMessages, "en-US": enMessages }}
        >
          <ThemeProvider>
            <AppShell>{children}</AppShell>
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  )
}

export const metadata = {
  title: "HFI Utility Center",
  description: "HFI campus space reservation and administration platform",
}
