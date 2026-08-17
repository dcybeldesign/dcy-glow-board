import type { ReactNode } from "react"
import { arcPath, clamp01, polarToXY } from "../lib/gaugeMath"

const START_DEG = 135
const SWEEP_DEG = 270
const END_DEG = START_DEG + SWEEP_DEG

export function TemperatureDial({
  min,
  max,
  current,
  target,
  color,
  size = 128,
  children,
}: {
  min: number
  max: number
  current?: number
  target?: number
  color: string
  size?: number
  children?: ReactNode
}) {
  const strokeWidth = 9
  const r = size / 2 - strokeWidth
  const cx = size / 2
  const cy = size / 2

  const valueDeg =
    target !== undefined ? START_DEG + clamp01((target - min) / (max - min)) * SWEEP_DEG : null
  const currentPt =
    current !== undefined
      ? polarToXY(cx, cy, r, START_DEG + clamp01((current - min) / (max - min)) * SWEEP_DEG)
      : null

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <path
          d={arcPath(cx, cy, r, START_DEG, END_DEG)}
          stroke="var(--seam)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
        />
        {valueDeg !== null && (
          <path
            d={arcPath(cx, cy, r, START_DEG, valueDeg)}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            style={{ transition: "d 0.4s ease, stroke 0.4s ease" }}
          />
        )}
        {currentPt && (
          <circle
            cx={currentPt.x}
            cy={currentPt.y}
            r={4}
            fill="var(--ink)"
            stroke="var(--parchment)"
            strokeWidth={1.5}
            style={{ transition: "cx 0.4s ease, cy 0.4s ease" }}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  )
}
