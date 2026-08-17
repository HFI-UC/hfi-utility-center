import { connection } from "next/server"

import { getCatalog } from "@/lib/api/catalog"

import { ReservationForm } from "./reservation-form"

export default async function ReservationCreatePage() {
  await connection()
  const catalog = await getCatalog()

  return <ReservationForm catalog={catalog} />
}
