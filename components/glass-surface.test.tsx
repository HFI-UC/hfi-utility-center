import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { GlassSurface } from "@/components/glass-surface"

vi.mock("liquid-glass-react", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="liquid-glass">{children}</div>,
}))

function setMedia(reducedMotion: boolean, reducedTransparency: boolean, coarse = false) {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query.includes("reduced-motion") ? reducedMotion : query.includes("reduced-transparency") ? reducedTransparency : coarse,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

describe("GlassSurface", () => {
  beforeEach(() => {
    setMedia(false, false)
    vi.stubGlobal("CSS", { supports: vi.fn(() => true) })
  })

  it("keeps content readable when reduced transparency is enabled", () => {
    setMedia(false, true)
    const { container } = render(<GlassSurface>预约教室</GlassSurface>)
    expect(screen.getByText("预约教室")).toBeVisible()
    expect(container.querySelector(".glass-fallback")).toBeInTheDocument()
  })

  it("keeps content readable when reduced motion is enabled", () => {
    setMedia(true, false)
    const { container } = render(<GlassSurface>Reservations</GlassSurface>)
    expect(screen.getByText("Reservations")).toBeVisible()
    expect(container.querySelector(".glass-fallback")).toBeInTheDocument()
  })
})
