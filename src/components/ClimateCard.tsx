import { useHomeAssistant } from "../hooks/useHomeAssistant"
import { useEntity } from "../hooks/useEntity"
import { useTranslation } from "../hooks/useTranslation"
import { getClimateColor, getClimateModeIcon } from "../lib/deviceIcons"
import { TemperatureDial } from "./TemperatureDial"
import type { ClimateCardStyle } from "../hooks/useDashboardConfig"
import type { TranslationKey } from "../lib/i18n"

const MODE_KEYS: Record<string, TranslationKey> = {
  off: "climate.mode.off",
  heat: "climate.mode.heat",
  cool: "climate.mode.cool",
  auto: "climate.mode.auto",
  heat_cool: "climate.mode.auto",
  dry: "climate.mode.dry",
  fan_only: "climate.mode.fan_only",
}

function CompactClimateCard({
  displayName,
  currentTemp,
  targetTemp,
  step,
  color,
  isActive,
  mode,
  onStep,
}: {
  displayName: string
  currentTemp?: number
  targetTemp?: number
  step: number
  color: string
  isActive: boolean
  mode: string
  onStep: (delta: number) => void
}) {
  const { t } = useTranslation()
  return (
    <div
      className="relative overflow-hidden rounded-2xl border p-3 transition-all duration-500"
      style={{
        borderColor: isActive ? color : "rgba(255,255,255,0.09)",
        background: "#000",
        boxShadow: isActive
          ? `0 0 22px -8px ${color}`
          : "0 0 3px 0 rgba(0,0,0,1), 0 0 8px 2px rgba(0,0,0,0.8)",
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={{ background: "var(--ink)", color }}
        >
          <div className="h-4 w-4">{getClimateModeIcon(mode)}</div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-[var(--parchment)]">{displayName}</div>
          <div className="mt-0.5 font-[family-name:var(--font-mono)] text-xs text-[var(--ash)]">
            {MODE_KEYS[mode] ? t(MODE_KEYS[mode]) : mode}
            {currentTemp !== undefined ? t("climate.currentInline", { temp: currentTemp }) : ""}
          </div>
        </div>
        {targetTemp !== undefined && (
          <>
            <button
              onClick={() => onStep(-step)}
              className="flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-full border text-[var(--parchment)] transition-colors hover:bg-[var(--ember-hover)]"
              style={{ borderColor: "var(--seam)" }}
            >
              −
            </button>
            <div className="font-[family-name:var(--font-mono)] text-lg shrink-0" style={{ color }}>
              {targetTemp}°
            </div>
            <button
              onClick={() => onStep(step)}
              className="flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-full border text-[var(--parchment)] transition-colors hover:bg-[var(--ember-hover)]"
              style={{ borderColor: "var(--seam)" }}
            >
              +
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export function ClimateCard({
  entityId,
  displayName,
  style = "default",
}: {
  entityId: string
  displayName?: string
  style?: ClimateCardStyle
}) {
  const entity = useEntity(entityId)
  const { callService } = useHomeAssistant()
  const { t } = useTranslation()

  if (!entity) return null

  const attrs = entity.attributes as Record<string, unknown>
  const currentTemp = attrs.current_temperature as number | undefined
  const targetTemp = attrs.temperature as number | undefined
  const currentHumidity = attrs.current_humidity as number | undefined
  const step = (attrs.target_temp_step as number | undefined) ?? 0.5
  const minTemp = (attrs.min_temp as number | undefined) ?? 7
  const maxTemp = (attrs.max_temp as number | undefined) ?? 35
  const hvacModes = (attrs.hvac_modes as string[] | undefined) ?? []
  const isActive = entity.state !== "off"

  const hvacAction = attrs.hvac_action as string | undefined
  const dialColor = getClimateColor(hvacAction ?? entity.state)
  const isGlowing = dialColor !== "var(--ash-dim)"
  const delta =
    currentTemp !== undefined && targetTemp !== undefined
      ? Math.abs(targetTemp - currentTemp)
      : 0
  const glowOpacity = isGlowing ? Math.min(0.45, 0.15 + delta * 0.06) : 0
  const resolvedName = displayName ?? (entity.attributes.friendly_name as string | undefined) ?? entityId

  function setTemperature(next: number) {
    callService("climate", "set_temperature", {
      entity_id: entityId,
      temperature: next,
    })
  }

  function setMode(mode: string) {
    callService("climate", "set_hvac_mode", {
      entity_id: entityId,
      hvac_mode: mode,
    })
  }

  if (style === "compact") {
    return (
      <CompactClimateCard
        displayName={resolvedName}
        currentTemp={currentTemp}
        targetTemp={targetTemp}
        step={step}
        color={dialColor}
        isActive={isGlowing}
        mode={entity.state}
        onStep={(d) => targetTemp !== undefined && setTemperature(targetTemp + d)}
      />
    )
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl border p-4 transition-all duration-500"
      style={{
        borderColor: isGlowing ? dialColor : "rgba(255,255,255,0.09)",
        background: "#000",
        opacity: isActive ? 1 : 0.6,
        boxShadow: isGlowing
          ? `0 0 26px -6px ${dialColor}`
          : "0 0 3px 0 rgba(0,0,0,1), 0 0 8px 2px rgba(0,0,0,0.8)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full blur-2xl transition-opacity duration-700"
        style={{ background: dialColor, opacity: glowOpacity }}
      />

      <div className="relative">
        <div className="mb-2 truncate text-center font-medium text-[var(--parchment)]">
          {displayName ?? entity.attributes.friendly_name ?? entityId}
        </div>

        <div className="flex items-center justify-center gap-3">
          {targetTemp !== undefined && (
            <button
              onClick={() => setTemperature(targetTemp - step)}
              className="h-8 w-8 shrink-0 rounded-full border text-[var(--parchment)] shadow-[0_2px_6px_-2px_rgba(0,0,0,0.6)] transition-all duration-150 hover:bg-[var(--ember-hover)] active:scale-90 active:shadow-none"
              style={{ borderColor: "var(--seam)" }}
            >
              −
            </button>
          )}

          <TemperatureDial
            min={minTemp}
            max={maxTemp}
            current={currentTemp}
            target={targetTemp}
            color={dialColor}
          >
            <div className="font-[family-name:var(--font-mono)] text-2xl text-[var(--parchment)]">
              {targetTemp !== undefined ? `${targetTemp}°` : "—"}
            </div>
            <div className="mt-0.5 text-[10px] text-[var(--ash)]">
              {t("climate.currentDial", { value: currentTemp !== undefined ? `${currentTemp}°` : "—" })}
            </div>
            {currentHumidity !== undefined && (
              <div className="mt-0.5 text-[10px] text-[var(--ash)]">
                {t("climate.humidityDial", { n: currentHumidity })}
              </div>
            )}
          </TemperatureDial>

          {targetTemp !== undefined && (
            <button
              onClick={() => setTemperature(targetTemp + step)}
              className="h-8 w-8 shrink-0 rounded-full border text-[var(--parchment)] shadow-[0_2px_6px_-2px_rgba(0,0,0,0.6)] transition-all duration-150 hover:bg-[var(--ember-hover)] active:scale-90 active:shadow-none"
              style={{ borderColor: "var(--seam)" }}
            >
              +
            </button>
          )}
        </div>

        {hvacModes.length > 0 && (
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {hvacModes.map((mode) => {
              const active = entity.state === mode
              const color = getClimateColor(mode)
              return (
                <button
                  key={mode}
                  onClick={() => setMode(mode)}
                  className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition-colors"
                  style={
                    active
                      ? { background: color, color: "var(--ink)" }
                      : { background: "var(--ink)", color: "var(--ash)" }
                  }
                >
                  <span className="h-3 w-3">{getClimateModeIcon(mode)}</span>
                  {MODE_KEYS[mode] ? t(MODE_KEYS[mode]) : mode}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
