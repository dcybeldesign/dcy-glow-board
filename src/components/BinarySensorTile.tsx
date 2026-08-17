import type { ReactElement } from "react"
import { useEntity } from "../hooks/useEntity"
import { useBinarySensorHistory, type BinaryHistoryPoint } from "../hooks/useBinarySensorHistory"
import { useTranslation } from "../hooks/useTranslation"
import { getBinarySensorIcon, getBinarySensorLabel } from "../lib/deviceIcons"
import type { BinarySensorCardStyle } from "../hooks/useDashboardConfig"
import { GlowCard } from "./GlowCard"

const HISTORY_HOURS = 12
const TRACK_SEGMENTS = 12

function stateAt(points: BinaryHistoryPoint[], time: number, fallback: boolean): boolean {
  let state = points.length > 0 ? points[0].isOn : fallback
  for (const p of points) {
    if (p.time > time) break
    state = p.isOn
  }
  return state
}

function TimelineBinarySensorCard({
  displayName,
  icon,
  deviceClass,
  label,
  isOn,
  alert,
  history,
}: {
  displayName: string
  icon: ReactElement
  deviceClass: string | undefined
  label: string
  isOn: boolean
  alert: boolean
  history: BinaryHistoryPoint[]
}) {
  const { t, language } = useTranslation()
  const eventTimeFormat = new Intl.DateTimeFormat(language === "fr" ? "fr-FR" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })
  const now = Date.now()
  const windowMs = HISTORY_HOURS * 3600_000
  const start = now - windowMs
  const onColor = alert ? "var(--danger)" : "var(--flame)"

  const segments = Array.from({ length: TRACK_SEGMENTS }, (_, i) => {
    const midpoint = start + ((i + 0.5) / TRACK_SEGMENTS) * windowMs
    return stateAt(history, midpoint, isOn)
  })

  const recentEvents = [...history].reverse().slice(0, 3)

  return (
    <GlowCard active={isOn && alert} color="var(--danger)" intensity={0.32}>
      <div className="flex items-center gap-3">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-500"
          style={{
            background: "var(--ink)",
            color: isOn ? (alert ? "var(--danger)" : "var(--flame)") : "var(--ash-dim)",
          }}
        >
          <div className="h-4 w-4">{icon}</div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-[var(--parchment)]">{displayName}</div>
          <div className="mt-0.5 text-xs" style={{ color: isOn && alert ? "var(--danger)" : "var(--ash)" }}>
            {label}
          </div>
        </div>
      </div>

      <div className="mt-3 flex gap-[2px]">
        {segments.map((on, i) => (
          <span
            key={i}
            className="h-5 flex-1 rounded-sm transition-colors duration-500"
            style={{ background: on ? onColor : "var(--seam)" }}
          />
        ))}
      </div>
      <div className="mt-1 flex justify-between font-[family-name:var(--font-mono)] text-[10px] text-[var(--ash-dim)]">
        <span>-{HISTORY_HOURS}h</span>
        <span>{t("common.now")}</span>
      </div>

      {recentEvents.length > 0 && (
        <div className="mt-2.5 flex flex-col gap-1">
          {recentEvents.map((event) => {
            const eventInfo = getBinarySensorLabel(deviceClass, event.isOn, t)
            return (
              <div
                key={event.time}
                className="flex gap-2 text-xs"
                style={{ color: event.isOn && eventInfo.alert ? "var(--danger)" : "var(--ash)" }}
              >
                <span className="font-[family-name:var(--font-mono)] text-[var(--ash-dim)]">
                  {eventTimeFormat.format(event.time)}
                </span>
                <span>{eventInfo.label}</span>
              </div>
            )
          })}
        </div>
      )}
    </GlowCard>
  )
}

export function BinarySensorTile({
  entityId,
  displayName,
  icon,
  style = "default",
}: {
  entityId: string
  displayName?: string
  icon?: ReactElement
  style?: BinarySensorCardStyle
}) {
  const entity = useEntity(entityId)
  const history = useBinarySensorHistory(entityId, HISTORY_HOURS)
  const { t } = useTranslation()

  if (!entity) return null

  const deviceClass = entity.attributes.device_class as string | undefined
  const isOn = entity.state === "on"
  const { label, alert } = getBinarySensorLabel(deviceClass, isOn, t)
  const resolvedName = displayName ?? (entity.attributes.friendly_name as string | undefined) ?? entityId
  const resolvedIcon = icon ?? getBinarySensorIcon(deviceClass)

  if (style === "timeline") {
    return (
      <TimelineBinarySensorCard
        displayName={resolvedName}
        icon={resolvedIcon}
        deviceClass={deviceClass}
        label={label}
        isOn={isOn}
        alert={alert}
        history={history}
      />
    )
  }

  return (
    <GlowCard
      active={isOn && alert}
      color="var(--danger)"
      intensity={0.32}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-500"
          style={{
            background: "var(--ink)",
            color: isOn ? (alert ? "var(--danger)" : "var(--flame)") : "var(--ash-dim)",
          }}
        >
          <div className="h-4 w-4">{resolvedIcon}</div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-[var(--parchment)]">
            {resolvedName}
          </div>
          <div
            className="mt-0.5 text-xs"
            style={{ color: isOn && alert ? "var(--danger)" : "var(--ash)" }}
          >
            {label}
          </div>
        </div>
      </div>
    </GlowCard>
  )
}
