import { AppShell } from "@/components/layout/app-shell"
import { LoadingState } from "@/components/layout/data-state"

export default function ReservationLoading() {
  return (
    <AppShell>
      <LoadingState rows={5} />
    </AppShell>
  )
}
