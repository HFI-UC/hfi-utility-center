import { AppShell } from "@/components/layout/app-shell"
import { LoadingState } from "@/components/layout/data-state"

export default function AdminLoginLoading() {
  return (
    <AppShell width="narrow">
      <div className="flex min-h-[80svh] items-center justify-center">
        <LoadingState rows={4} />
      </div>
    </AppShell>
  )
}
