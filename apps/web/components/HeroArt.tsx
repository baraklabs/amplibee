// A honeycomb field behind the hero. Hexagon outlines are one static path; a handful of cells fill in and
// fade out at staggered times, like honey being stored. Pure SVG and CSS, no client JavaScript.
// The centre is masked out so the headline and input stay clean. Hidden from assistive tech.

const R = 34 // hexagon radius
const W = Math.sqrt(3) * R // cell width
const H = 1.5 * R // row spacing
const VW = 1600
const VH = 460

function hex(cx: number, cy: number, r = R - 1.5): string {
  const pts = Array.from({ length: 6 }, (_, k) => {
    const a = (Math.PI / 180) * (60 * k - 30)
    return `${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`
  })
  return `M${pts.join('L')}Z`
}

interface Cell {
  x: number
  y: number
}

function cells(): Cell[] {
  const out: Cell[] = []
  for (let j = -1; j * H < VH + R; j++) {
    for (let i = -1; i * W < VW + W; i++) {
      out.push({ x: i * W + (((j % 2) + 2) % 2) * (W / 2), y: j * H })
    }
  }
  return out
}

export function HeroArt() {
  const all = cells()
  const outline = all.map((c) => hex(c.x, c.y)).join('')
  // Deterministic spread of animated cells, kept away from the middle where the text sits.
  const lit = all.filter((c, n) => (n * 37) % 11 === 0 && Math.abs(c.x - VW / 2) > 330)
  return (
    <svg className="hero-art" viewBox={`0 0 ${VW} ${VH}`} aria-hidden="true" focusable="false">
      <path d={outline} className="hex-outline" />
      {lit.map((c, n) => (
        <path
          key={`${c.x}-${c.y}`}
          d={hex(c.x, c.y, R - 4)}
          className={`hex-fill${n % 4 === 0 ? ' strong' : ''}`}
          style={{ animationDelay: `${((n * 7) % 13) * 0.55}s`, animationDuration: `${5 + (n % 4)}s` }}
        />
      ))}
    </svg>
  )
}
