"use client"

import { useState } from "react"

const modes = ["Intertwine", "Deconstruct", "Connect"] as const

function torusPoint(u: number, v: number) {
  const x = (175 + 62 * Math.cos(v)) * Math.cos(u)
  const y = (175 + 62 * Math.cos(v)) * Math.sin(u)
  const z = 62 * Math.sin(v)
  const tilt = 1.05
  const rotatedY = y * Math.cos(tilt) - z * Math.sin(tilt)
  const angle = -0.58
  return `${(320 + x * Math.cos(angle) - rotatedY * Math.sin(angle)).toFixed(2)},${(320 + x * Math.sin(angle) + rotatedY * Math.cos(angle)).toFixed(2)}`
}

const rings = Array.from({ length: 20 }, (_, i) =>
  Array.from({ length: 101 }, (_, j) =>
    torusPoint((j / 100) * Math.PI * 2, (i / 20) * Math.PI * 2)
  ).join(" ")
)
const ribs = Array.from({ length: 48 }, (_, i) =>
  Array.from({ length: 41 }, (_, j) =>
    torusPoint((i / 48) * Math.PI * 2, (j / 40) * Math.PI * 2)
  ).join(" ")
)

export function GeometryStudy() {
  const [mode, setMode] = useState(0)
  return (
    <div className="geometry-study" data-mode={mode}>
      <div className="study-visual" aria-hidden="true">
        <div className="study-grid" />
        <div className="study-cross cross-top">+</div>
        <div className="study-cross cross-bottom">+</div>
        <svg className="study-svg" viewBox="0 0 640 640" fill="none">
          <g className="construction-lines">
            <path d="M30 320H610M320 35V605M80 80L560 560M90 535L535 90" />
            <circle cx="320" cy="320" r="265" />
            <circle cx="320" cy="320" r="210" strokeDasharray="2 9" />
            <path d="M100 165V100H165M475 540H540V475" />
          </g>
          <g className="torus-object">
            {rings.map((points, i) => (
              <polyline key={`ring-${i}`} points={points} />
            ))}
            {ribs.map((points, i) => (
              <polyline
                key={`rib-${i}`}
                points={points}
                className="torus-rib"
              />
            ))}
          </g>
          <g className="fragment-object">
            <path className="shard shard-one" d="M150 160L358 238L275 365Z" />
            <path className="shard shard-two" d="M390 120L449 350L317 299Z" />
            <path className="shard shard-three" d="M140 470L295 333L400 408Z" />
            <path className="shard shard-four" d="M480 230L514 440L392 366Z" />
            <path className="shard shard-five" d="M265 399L369 520L312 443Z" />
            <path
              className="fragment-guide"
              d="M150 160L390 120L514 440L369 520L140 470Z"
            />
          </g>
          <g className="connection-object">
            <path d="M84 320H245L368 155H545M245 320H545M245 320L368 485H545M368 155V85H455M368 485V555H455" />
            {[
              [84, 320],
              [245, 320],
              [545, 155],
              [545, 320],
              [545, 485],
              [455, 85],
              [455, 555],
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={i === 1 ? 13 : 6} />
            ))}
            <path className="connection-pulse" d="M84 320H245L368 155H545" />
          </g>
          <g className="orbit-satellite">
            <circle cx="565" cy="320" r="5" />
            <path d="M556 320H574M565 311V329" />
          </g>
        </svg>
        <span className="study-tag tag-one">
          FIG. 0{mode + 1}
          <br />
          SPATIAL STUDIES
        </span>
        <span className="study-tag tag-two">
          FORM / {String(mode + 1).padStart(2, "0")}
          <br />
          INFINITE POSSIBILITIES
        </span>
        <span className="study-word">{modes[mode]}</span>
      </div>
      <div
        className="study-controls"
        role="group"
        aria-label="Geometry composition"
      >
        {modes.map((name, i) => (
          <button
            key={name}
            onClick={() => setMode(i)}
            aria-pressed={mode === i}
          >
            <span>0{i + 1}</span>
            {name}
            <span className="mode-indicator" />
          </button>
        ))}
      </div>
    </div>
  )
}
