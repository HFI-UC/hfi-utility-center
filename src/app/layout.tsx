import { geist, geistMono, notoSansSC } from "@/app/fonts"

import "./globals.css"

import { Providers } from "@/app/providers"

const fontVariables = `${geist.variable} ${geistMono.variable} ${notoSansSC.variable}`

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className={fontVariables} suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

export const viewport = {
  viewportFit: "cover" as const,
}

export const metadata = {
  title: {
    default: "HFI Utility Center · 校园场地服务",
    template: "%s · HFI Utility Center",
  },
  description: "预约校园场地、查询预约进度、查看场地使用情况。",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
  },
}
