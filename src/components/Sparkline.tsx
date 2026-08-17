import { useId } from "react"
import type { HistoryPoint } from "../hooks/useEntityHistory"

export function Sparkline({
  points,
  color = "var(--moss)",
  width = 200,
  height = 40,
}: {
  points: HistoryPoint[]
  color?: string
  width?: number
  height?: number
}) {
  const gradientId = useId()

  if (points.length < 2) {
    return <div style={{ height }} />
  }

  const values = points.map((p) => p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width
    const y = height - ((p.value - min) / range) * height
    return [x, y] as const
  })

  const line = coords
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ")

  const area = `${line} L${width},${height} L0,${height} Z`

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${gradientId})`} stroke="none" />
        <path d={line} fill="none" stroke={color} strokeWidth={1.5} />
      </svg>
      <span
        className="pointer-events-none absolute right-1 top-1 font-[family-name:var(--font-mono)] text-[10px] leading-none font-medium text-[var(--parchment)]"
        style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}
      >
        {Number(max.toFixed(1))}
      </span>
      <span
        className="pointer-events-none absolute right-1 bottom-1 font-[family-name:var(--font-mono)] text-[10px] leading-none font-medium text-[var(--parchment)]"
        style={{ textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}
      >
        {Number(min.toFixed(1))}
      </span>
      <span className="pointer-events-none absolute left-0 bottom-1 text-[9px] leading-none text-[var(--ash-dim)]">
        24h
      </span>
    </div>
  )
}
