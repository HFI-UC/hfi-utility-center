"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

import { CancelReservationFlow } from "./cancel-reservation-flow"

function CancelReservationContent() {
  const token = useSearchParams().get("token") ?? ""
  return <CancelReservationFlow token={token} />
}

export default function CancelReservationPage() {
  return (
    <Suspense fallback={null}>
      <CancelReservationContent />
    </Suspense>
  )
}
