import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ReservationForm } from "@/components/reservation-form"

export default function ReservationCreate() {
  return (
    <main id="main" className="utility-page">
      <Link href="/" className="back-link">
        <ArrowLeft size={16} /> BACK TO OVERVIEW
      </Link>
      <div className="utility-heading">
        <p className="eyebrow">01 / RESERVE</p>
        <h1>
          A SPACE.
          <br />
          YOUR IDEAS<span className="type-dot">.</span>
        </h1>
        <p>Make room for what comes next.</p>
      </div>
      <ReservationForm />
    </main>
  )
}
