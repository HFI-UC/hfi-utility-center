import { getBootstrap } from "@/lib/api/catalog"
import { ReservationForm } from "./reservation-form"

export default async function ReservationCreatePage() {
  const catalog = await getBootstrap().catch(() => undefined)
  return <ReservationForm initialCatalog={catalog} />
}
