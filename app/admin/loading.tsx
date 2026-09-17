import { Spinner } from "@/components/astryx"

export default function Loading() {
  return (
    <main className="flex min-h-64 items-center justify-center">
      <Spinner className="size-8" />
    </main>
  )
}
