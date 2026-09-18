import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ReservationSearch } from "@/components/reservation-search"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ keyword?: string | string[] }>
}) {
  const { keyword } = await searchParams
  return (
    <main id="main" className="utility-page">
      <Link href="/" className="back-link">
        <ArrowLeft size={16} /> BACK TO OVERVIEW
      </Link>
      <div className="utility-heading">
        <p className="eyebrow">02 / FIND</p>
        <h1>
          YOUR PLANS.
          <br />
          ONE PLACE<span className="type-dot">.</span>
        </h1>
        <p>A clearer view of what’s ahead.</p>
      </div>
      <ReservationSearch
        initialKeyword={typeof keyword === "string" ? keyword : ""}
      />
    </main>
  )
}
