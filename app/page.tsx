import { ArrowDown, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { GeometryStudy } from "@/components/geometry-study"

export default function Page() {
  return (
    <main id="main" className="reconstruct-home">
      <section className="reconstruct-hero" aria-labelledby="hero-title">
        <div className="hero-register">
          <span>HFI — UTILITY CENTER</span>
          <span>A STUDY IN CONNECTION / 001</span>
          <span>空间 · 秩序 · 可能性</span>
        </div>
        <div className="reconstruct-composition">
          <div className="reconstruct-copy">
            <p className="eyebrow">
              <span className="register-square" /> RE:THINK YOUR EVERYDAY
            </p>
            <h1 id="hero-title">
              <span className="title-make">Make</span>
              <span className="title-space">
                space<span className="title-period">.</span>
              </span>
            </h1>
            <div className="title-caption">
              <span className="caption-rule" />
              <span>
                FOR WHAT
                <br />
                COMES NEXT.
              </span>
            </div>
            <p className="intro-copy">
              Ideas take shape when people connect.
              <br />
              Find your space. Make something happen.
            </p>
            <Link className="hero-action" href="/reservation/create">
              Book a room <ArrowUpRight size={19} />
            </Link>
          </div>
          <GeometryStudy />
          <span className="vertical-register" aria-hidden="true">
            RECONSTRUCT THE ORDINARY — HFI / UC
          </span>
        </div>
        <div className="hero-endline">
          <span className="hero-coordinates">PEOPLE × SPACE × IDEAS</span>
          <a href="#services">
            EXPLORE THE POSSIBILITIES <ArrowDown size={14} />
          </a>
          <span className="edition-label">[ SCROLL TO CONNECT ]</span>
        </div>
      </section>
      <section
        id="services"
        className="reconstruct-services"
        aria-labelledby="services-title"
      >
        <div className="services-heading">
          <h2 id="services-title">Everyday, reimagined.</h2>
          <span className="eyebrow">TWO WAYS TO MOVE FORWARD ↙</span>
        </div>
        <div className="service-strips">
          <Link href="/reservation/create" className="service-strip">
            <span className="strip-number">01 /</span>
            <div className="strip-symbol space-symbol" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
            <div className="strip-title">
              <span className="eyebrow">RESERVE A POSSIBILITY</span>
              <h3>Book a room</h3>
            </div>
            <p>
              A space to meet.
              <br />A place to begin.
            </p>
            <span className="strip-arrow">
              <ArrowUpRight strokeWidth={1} />
            </span>
          </Link>
          <Link href="/reservation/search" className="service-strip">
            <span className="strip-number">02 /</span>
            <div className="strip-symbol search-orbit" aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
            <div className="strip-title">
              <span className="eyebrow">RECONNECT WITH YOUR PLANS</span>
              <h3>Find a reservation</h3>
            </div>
            <p>
              Every plan, connected.
              <br />
              Every detail, in view.
            </p>
            <span className="strip-arrow">
              <ArrowUpRight strokeWidth={1} />
            </span>
          </Link>
        </div>
      </section>
      <div className="closing-statement">
        <span className="closing-star" aria-hidden="true">
          ✳
        </span>
        <p>
          Less friction.
          <br />
          <span>More possibility.</span>
        </p>
        <div className="closing-lines" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <span className="eyebrow">
          DESIGNED AROUND YOU.
          <br />
          BUILT FOR WHAT’S NEXT.
        </span>
      </div>
    </main>
  )
}
