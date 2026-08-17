import type { ReactElement } from "react"
import { useHomeAssistant } from "../hooks/useHomeAssistant"
import { useEntity } from "../hooks/useEntity"
import { useLiveSlider } from "../hooks/useLiveSlider"
import { useTranslation } from "../hooks/useTranslation"
import { FanIcon } from "../lib/deviceIcons"
import { GlowCard } from "./GlowCard"

export function FanTile({
  entityId,
  displayName,
  icon,
}: {
  entityId: string
  displayName?: string
  icon?: ReactElement
}) {
  const entity = useEntity(entityId)
  const { callService } = useHomeAssistant()
  const { t } = useTranslation()

  const isOn = entity?.state === "on"
  const percentage = entity?.attributes.percentage as number | undefined

  function setSpeed(pct: number) {
    callService("fan", "set_percentage", { entity_id: entityId, percentage: pct })
  }

  const speedSlider = useLiveSlider(percentage ?? 100, setSpeed)

  if (!entity) return null

  function toggle() {
    callService("fan", isOn ? "turn_off" : "turn_on", { entity_id: entityId })
  }

  const glowIntensity = 0.15 + ((percentage ?? 100) / 100) * 0.35

  return (
    <GlowCard active={isOn} color="var(--frost)" intensity={glowIntensity}>
      <div className="flex items-center gap-3">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-500"
          style={{ background: "var(--ink)", color: isOn ? "var(--frost)" : "var(--ash-dim)" }}
        >
          <div className={`h-4 w-4 ${isOn ? "fan-spin" : ""}`}>
            {icon ?? <FanIcon />}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-[var(--parchment)]">
            {displayName ?? entity.attributes.friendly_name ?? entityId}
          </div>
          <div className="mt-0.5 font-[family-name:var(--font-mono)] text-xs text-[var(--ash)]">
            {isOn ? t("common.on") : t("common.off")}
            {isOn && percentage !== undefined ? ` · ${speedSlider.value}%` : ""}
          </div>
        </div>

        <button
          type="button"
          onClick={toggle}
          aria-pressed={isOn}
          className="box-content flex h-5 w-9 shrink-0 items-center rounded-full border-0 p-0.5 transition-colors duration-300"
          style={{
            background: isOn ? "var(--frost)" : "var(--seam)",
            justifyContent: isOn ? "flex-end" : "flex-start",
          }}
        >
          <span className="block h-4 w-4 rounded-full bg-[var(--ink)] transition-transform duration-300" />
        </button>
      </div>

      {percentage !== undefined && isOn && (
        <input
          type="range"
          min={1}
          max={100}
          value={speedSlider.value}
          onChange={(e) => speedSlider.onChange(Number(e.target.value))}
          className="mt-3 w-full accent-[var(--frost)]"
        />
      )}
    </GlowCard>
  )
}
