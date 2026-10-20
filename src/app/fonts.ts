import { Geist, Geist_Mono, Noto_Sans_SC } from "next/font/google"

export const geist = Geist({
  weight: "variable",
  subsets: ["latin", "latin-ext"],
  variable: "--font-geist",
  display: "swap",
})

export const geistMono = Geist_Mono({
  weight: "variable",
  subsets: ["latin", "latin-ext"],
  variable: "--font-geist-mono",
  display: "swap",
})

// CJK faces are huge and split into ~100 unicode-range chunks, so they are not preloaded.
export const notoSansSC = Noto_Sans_SC({
  weight: "variable",
  preload: false,
  variable: "--font-noto-sans-sc",
  display: "swap",
})
