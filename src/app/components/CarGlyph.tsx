import type { CarArt } from '../../data/cars'
import { carShapes } from '../../data/carShapes'

// Vignette de la silhouette. Le même tracé est extrudé en 3D dans la scène
// principale (CarViewer), ce qui garde les deux représentations cohérentes.

export function CarGlyph({ art, className }: { art: CarArt; className?: string }) {
  const shape = carShapes[art]

  return (
    <svg viewBox="0 0 1000 400" className={className} role="img" aria-hidden="true">
      <g className="glyph-body">
        <path d={shape.body} />
      </g>
      {shape.glass.map((d, i) => (
        <path key={i} className="glyph-glass" d={d} />
      ))}
      {shape.lines.map((d, i) => (
        <path key={i} className="glyph-line" d={d} />
      ))}
      {shape.wheels.map((wheel) => (
        <g key={wheel.x}>
          <circle cx={wheel.x} cy={300} r={wheel.r} fill="#0c0b0b" stroke="rgba(255,255,255,0.5)" strokeWidth="3" />
          <circle cx={wheel.x} cy={300} r={wheel.r * 0.52} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" />
          <circle cx={wheel.x} cy={300} r={wheel.r * 0.16} fill="rgba(255,255,255,0.7)" />
        </g>
      ))}
      <ellipse cx="500" cy="368" rx="430" ry="12" fill="rgba(0,0,0,0.35)" />
    </svg>
  )
}
