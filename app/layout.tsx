import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AppShell } from "@/components/app-shell"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getMessages } from "next-intl/server"

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const messages = await getMessages()
  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className="font-sans antialiased"
    >
      <body>
        <NextIntlClientProvider messages={messages}><ThemeProvider><AppShell>{children}</AppShell></ThemeProvider></NextIntlClientProvider>
      </body>
    </html>
  )
}

export const metadata = {
  title: "HFI Utility Center",
  description: "HFI campus space reservation and administration platform",
}
