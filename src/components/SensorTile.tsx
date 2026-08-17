import { useEffect, useRef, type ReactElement } from "react"
import { useEntity } from "../hooks/useEntity"
import { useEntityHistory } from "../hooks/useEntityHistory"
import { useUnits } from "../hooks/useUnits"
import { Sparkline } from "./Sparkline"
import { getSensorIcon, getSensorValueColor } from "../lib/deviceIcons"
import { getSensorRange } from "../lib/sensorRange"
import { arcPath, clamp01, polarToXY } from "../lib/gaugeMath"
import { GlowCard } from "./GlowCard"
import type { SensorCardStyle } from "../hooks/useDashboardConfig"

const ARC_START = 135
const ARC_SWEEP = 270
const NEEDLE_START = 180
const NEEDLE_SWEEP = 180

function ArcGauge({ value, min, max, color, unit }: { value: number; min: number; max: number; color: string; unit?: string }) {
  const size = 108
  const strokeWidth = 9
  const r = size / 2 - strokeWidth
  const cx = size / 2
  const cy = size / 2
  const t = clamp01((value - min) / (max - min))
  const end = ARC_START + t * ARC_SWEEP

  return (
    <div className="flex justify-center py-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <path d={arcPath(cx, cy, r, ARC_START, ARC_START + ARC_SWEEP)} stroke="var(--seam)" strokeWidth={strokeWidth} strokeLinecap="round" fill="none" />
          <path d={arcPath(cx, cy, r, ARC_START, end)} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" style={{ transition: "d 0.4s ease" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="font-[family-name:var(--font-mono)] text-lg" style={{ color }}>
            {value}
            {unit && <span className="text-xs text-[var(--ash)]">{unit}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

function NeedleGauge({ value, min, max, color, unit }: { value: number; min: number; max: number; color: string; unit?: string }) {
  const width = 128
  const height = 78
  const cx = width / 2
  const cy = height - 10
  const r = 52
  const t = clamp01((value - min) / (max - min))
  const needleDeg = NEEDLE_START + t * NEEDLE_SWEEP
  const tip = polarToXY(cx, cy, r - 18, needleDeg)

  return (
    <div className="flex flex-col items-center py-1">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <path d={arcPath(cx, cy, r, NEEDLE_START, NEEDLE_START + NEEDLE_SWEEP)} stroke="var(--seam)" strokeWidth={8} strokeLinecap="round" fill="none" />
        <path d={arcPath(cx, cy, r, NEEDLE_START, needleDeg)} stroke={color} strokeWidth={8} strokeLinecap="round" fill="none" style={{ transition: "d 0.4s ease" }} />
        <line x1={cx} y1={cy} x2={tip.x} y2={tip.y} stroke="var(--parchment)" strokeWidth={2.5} strokeLinecap="round" style={{ transition: "x2 0.4s ease, y2 0.4s ease" }} />
        <circle cx={cx} cy={cy} r={4.5} fill="var(--parchment)" />
      </svg>
      <div className="-mt-1 font-[family-name:var(--font-mono)] text-lg" style={{ color }}>
        {value}
        {unit && <span className="text-xs text-[var(--ash)]">{unit}</span>}
      </div>
    </div>
  )
}

function ThermometerGauge({ value, min, max, color, unit }: { value: number; min: number; max: number; color: string; unit?: string }) {
  const t = clamp01((value - min) / (max - min))
  return (
    <div className="flex items-center gap-4 py-1">
      <div className="relative h-24 w-5 shrink-0 overflow-hidden rounded-full" style={{ background: "var(--seam)" }}>
        <div
          className="absolute bottom-0 left-0 right-0 rounded-full transition-all duration-500"
          style={{ height: `${t * 100}%`, background: color }}
        />
      </div>
      <div className="flex flex-col justify-center gap-0.5">
        <div className="font-[family-name:var(--font-mono)] text-2xl" style={{ color }}>
          {value}
          {unit && <span className="ml-1 text-sm text-[var(--ash)]">{unit}</span>}
        </div>
        <div className="font-[family-name:var(--font-mono)] text-[11px] text-[var(--ash-dim)]">
          {min}{unit} · {max}{unit}
        </div>
      </div>
    </div>
  )
}

function RingGauge({ value, min, max, color, unit }: { value: number; min: number; max: number; color: string; unit?: string }) {
  const size = 64
  const r = 26
  const strokeWidth = 5
  const circumference = 2 * Math.PI * r
  const t = clamp01((value - min) / (max - min))

  return (
    <div className="flex items-center gap-4 py-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--seam)" strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - t)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.4s ease" }}
        />
      </svg>
      <div className="font-[family-name:var(--font-mono)] text-xl" style={{ color }}>
        {value}
        {unit && <span className="text-xs text-[var(--ash)]">{unit}</span>}
      </div>
    </div>
  )
}

export function SensorTile({
  entityId,
  displayName,
  icon,
  style = "default",
  range,
}: {
  entityId: string
  displayName?: string
  icon?: ReactElement
  style?: SensorCardStyle
  range?: { min: number; max: number }
}) {
  const entity = useEntity(entityId)
  const points = useEntityHistory(entityId, 24)
  const { convert } = useUnits()
  const iconRef = useRef<HTMLDivElement>(null)
  const firstRender = useRef(true)
  const stateValue = entity?.state

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    const el = iconRef.current
    if (!el) return
    el.classList.remove("icon-pulse")
    void el.offsetWidth
    el.classList.add("icon-pulse")
  }, [stateValue])

  if (!entity) return null

  const unit = entity.attributes.unit_of_measurement as string | undefined
  const deviceClass = entity.attributes.device_class as string | undefined
  const rawValue = Number(entity.state)
  const isNumeric = Number.isFinite(rawValue)
  // Color thresholds (e.g. "cold" below 16, "hot" above 26) are defined in the
  // sensor's own native unit, so they're computed on the raw value, never the
  // converted display value.
  const valueColor = getSensorValueColor(deviceClass, unit, rawValue)
  const cardColor = valueColor ?? "var(--moss)"
  const isGauge = style !== "default" && isNumeric

  const converted = isNumeric ? convert(rawValue, unit) : null
  const unitChanged = converted !== null && converted.unit !== (unit ?? "")
  const displayValue = unitChanged ? String(converted!.value) : entity.state
  const displayUnit = converted?.unit ?? unit

  const rawRange = range ?? getSensorRange(deviceClass, unit, rawValue, points.map((p) => p.value))
  const gaugeValue = converted ? converted.value : rawValue
  const gaugeMin = convert(rawRange.min, unit).value
  const gaugeMax = convert(rawRange.max, unit).value
  const convertedPoints = points.map((p) => ({ time: p.time, value: convert(p.value, unit).value }))

  return (
    <GlowCard active color={cardColor} intensity={0.24}>
      <div className="mb-2 flex items-center gap-3">
        <div
          ref={iconRef}
          aria-hidden
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-500"
          style={{ background: "var(--ink)", color: cardColor }}
        >
          <div className="h-4 w-4">{icon ?? getSensorIcon(deviceClass, unit)}</div>
        </div>
        <div className="min-w-0 flex-1 truncate font-medium text-[var(--parchment)]">
          {displayName ?? entity.attributes.friendly_name ?? entityId}
        </div>
      </div>

      {isGauge ? (
        <>
          {style === "arc" && (
            <ArcGauge value={gaugeValue} min={gaugeMin} max={gaugeMax} color={cardColor} unit={displayUnit} />
          )}
          {style === "needle" && (
            <NeedleGauge value={gaugeValue} min={gaugeMin} max={gaugeMax} color={cardColor} unit={displayUnit} />
          )}
          {style === "thermometer" && (
            <ThermometerGauge value={gaugeValue} min={gaugeMin} max={gaugeMax} color={cardColor} unit={displayUnit} />
          )}
          {style === "ring" && (
            <RingGauge value={gaugeValue} min={gaugeMin} max={gaugeMax} color={cardColor} unit={displayUnit} />
          )}
        </>
      ) : (
        <>
          <div
            className="mb-2 font-[family-name:var(--font-mono)] text-3xl transition-colors duration-500"
            style={{ color: valueColor ?? "var(--parchment)" }}
          >
            {displayValue}
            {displayUnit ? <span className="ml-1 text-sm text-[var(--ash)]">{displayUnit}</span> : null}
          </div>
          <Sparkline points={convertedPoints} color={cardColor} />
        </>
      )}
    </GlowCard>
  )
}
