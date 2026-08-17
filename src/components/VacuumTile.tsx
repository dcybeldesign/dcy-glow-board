import { useHomeAssistant } from "../hooks/useHomeAssistant"
import { useEntity } from "../hooks/useEntity"
import { useTranslation } from "../hooks/useTranslation"
import { MediaPauseIcon, MediaPlayIcon, ReturnDockIcon, VacuumIcon } from "../lib/deviceIcons"
import { clamp01 } from "../lib/gaugeMath"
import type { VacuumCardStyle } from "../hooks/useDashboardConfig"
import type { TranslationKey } from "../lib/i18n"
import { GlowCard } from "./GlowCard"

const STATE_LABEL_KEYS: Record<string, TranslationKey> = {
  cleaning: "vacuum.state.cleaning",
  docked: "vacuum.state.docked",
  paused: "vacuum.state.paused",
  idle: "vacuum.state.idle",
  returning: "vacuum.state.returning",
  error: "vacuum.state.error",
}

function BatteryRing({ value }: { value: number }) {
  const size = 52
  const r = 21
  const strokeWidth = 5
  const circumference = 2 * Math.PI * r
  const t = clamp01(value / 100)

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--seam)" strokeWidth={strokeWidth} fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="var(--frost)"
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - t)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.4s ease" }}
      />
    </svg>
  )
}

function ControlRow({
  state,
  onStart,
  onPause,
  onReturn,
}: {
  state: string
  onStart: () => void
  onPause: () => void
  onReturn: () => void
}) {
  const { t } = useTranslation()
  return (
    <div className="flex gap-2">
      {state === "cleaning" ? (
        <button
          type="button"
          onClick={onPause}
          className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border text-xs text-[var(--parchment)] transition-colors hover:bg-[var(--ember-hover)]"
          style={{ borderColor: "var(--seam)" }}
        >
          <div className="h-3.5 w-3.5">
            <MediaPauseIcon />
          </div>
          {t("vacuum.pause")}
        </button>
      ) : (
        <button
          type="button"
          onClick={onStart}
          className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border text-xs text-[var(--parchment)] transition-colors hover:bg-[var(--ember-hover)]"
          style={{ borderColor: "var(--seam)" }}
        >
          <div className="h-3.5 w-3.5">
            <MediaPlayIcon />
          </div>
          {state === "paused" ? t("vacuum.resume") : t("vacuum.start")}
        </button>
      )}
      {state !== "docked" && (
        <button
          type="button"
          onClick={onReturn}
          className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border text-xs text-[var(--parchment)] transition-colors hover:bg-[var(--ember-hover)]"
          style={{ borderColor: "var(--seam)" }}
        >
          <div className="h-3.5 w-3.5">
            <ReturnDockIcon />
          </div>
          {t("vacuum.base")}
        </button>
      )}
    </div>
  )
}

export function VacuumTile({
  entityId,
  displayName,
  style = "default",
}: {
  entityId: string
  displayName?: string
  style?: VacuumCardStyle
}) {
  const entity = useEntity(entityId)
  const { callService } = useHomeAssistant()
  const { t } = useTranslation()
  if (!entity) return null

  const state = entity.state
  const isCleaning = state === "cleaning"
  const batteryLevel = entity.attributes.battery_level as number | undefined
  const resolvedName = displayName ?? (entity.attributes.friendly_name as string | undefined) ?? entityId
  const label = STATE_LABEL_KEYS[state] ? t(STATE_LABEL_KEYS[state]) : state

  function start() {
    callService("vacuum", "start", { entity_id: entityId })
  }
  function pause() {
    callService("vacuum", "pause", { entity_id: entityId })
  }
  function returnToBase() {
    callService("vacuum", "return_to_base", { entity_id: entityId })
  }

  if (style === "tile") {
    return (
      <GlowCard active={isCleaning} color="var(--frost)" intensity={0.28}>
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
            style={{ background: "var(--ink)", color: isCleaning ? "var(--frost)" : "var(--ash-dim)" }}
          >
            <div className="h-4 w-4">
              <VacuumIcon />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium text-[var(--parchment)]">{resolvedName}</div>
            <div className="mt-0.5 text-xs text-[var(--ash)]">{label}</div>
          </div>
        </div>
        {batteryLevel !== undefined && (
          <div className="mt-3 flex items-center gap-3">
            <BatteryRing value={batteryLevel} />
            <div>
              <div className="font-[family-name:var(--font-mono)] text-lg" style={{ color: "var(--frost)" }}>
                {batteryLevel}%
              </div>
              <div className="text-xs text-[var(--ash-dim)]">{t("vacuum.battery")}</div>
            </div>
          </div>
        )}
        <div className="mt-3">
          <ControlRow state={state} onStart={start} onPause={pause} onReturn={returnToBase} />
        </div>
      </GlowCard>
    )
  }

  return (
    <GlowCard active={isCleaning} color="var(--frost)" intensity={0.28}>
      <div className="flex items-center gap-3">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={{ background: "var(--ink)", color: isCleaning ? "var(--frost)" : "var(--ash-dim)" }}
        >
          <div className="h-4 w-4">
            <VacuumIcon />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-[var(--parchment)]">{resolvedName}</div>
          <div className="mt-0.5 font-[family-name:var(--font-mono)] text-xs text-[var(--ash)]">
            {label}
            {batteryLevel !== undefined ? ` · ${t("vacuum.batterySuffix", { n: batteryLevel })}` : ""}
          </div>
        </div>
      </div>
      <div className="mt-3">
        <ControlRow state={state} onStart={start} onPause={pause} onReturn={returnToBase} />
      </div>
    </GlowCard>
  )
}
