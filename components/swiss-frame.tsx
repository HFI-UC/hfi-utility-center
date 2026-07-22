"use client"

import { usePathname } from "next/navigation"

const screens = [
  { prefix: "/reservation/create", number: "02", label: "BOOKING" },
  { prefix: "/reservation/search", number: "03", label: "RESERVATIONS" },
  { prefix: "/admin", number: "04", label: "ADMIN WORKSPACE" },
  { prefix: "/about", number: "05", label: "ABOUT" },
]

function RegistrationMark() {
  return <span className="swiss-registration" aria-hidden="true" />
}

export function SwissMetaBar() {
  const pathname = usePathname()
  const screen = screens.find((item) => pathname.startsWith(item.prefix)) ?? { number: "01", label: "HOMEPAGE" }

  return (
    <div className="border-b border-foreground/30">
      <div className="mx-auto grid h-8 max-w-[96rem] grid-cols-[1fr_auto_1fr] items-center px-4 font-mono text-[0.625rem] font-bold sm:px-8">
        <p>SCREEN {screen.number}<span className="px-3 text-red-600">/</span>{screen.label}</p>
        <RegistrationMark />
        <p className="text-right">HFI UTILITY CENTER<span className="px-3 text-red-600">/</span>v1.0</p>
      </div>
    </div>
  )
}

export function SwissFooterBar() {
  return (
    <footer className="border-t border-foreground/30">
      <div className="mx-auto grid h-10 max-w-[96rem] grid-cols-[1fr_auto_1fr] items-center px-4 font-mono text-[0.625rem] font-bold text-red-600 sm:px-8">
        <p>GRID SYSTEM: 12 COLUMNS</p>
        <RegistrationMark />
        <p className="text-right">BASELINE: 8PX</p>
      </div>
    </footer>
  )
}
