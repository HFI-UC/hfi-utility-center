import { AppShell } from "@/components/layout/app-shell"
import { LoadingState } from "@/components/layout/data-state"

export default function Loading() {
  return (
    <AppShell>
      <LoadingState rows={4} />
    </AppShell>
  )
}
