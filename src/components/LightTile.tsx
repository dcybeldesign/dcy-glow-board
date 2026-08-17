import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
} from "react"
import { useHomeAssistant } from "../hooks/useHomeAssistant"
import { useEntity } from "../hooks/useEntity"
import { useLiveSlider } from "../hooks/useLiveSlider"
import { useTranslation } from "../hooks/useTranslation"
import {
  getLightIcon,
  getLightAccentColor,
  getCurrentKelvin,
  FlameIcon,
  SnowflakeIcon,
  ChevronDownIcon,
} from "../lib/deviceIcons"
import { hsvToRgb, rgbToHsv } from "../lib/colorMath"
import type { LightCardStyle } from "../hooks/useDashboardConfig"

const COLOR_PRESETS: [number, number, number][] = [
  [255, 82, 82],
  [255, 152, 0],
  [255, 214, 0],
  [76, 217, 100],
  [64, 200, 224],
  [64, 128, 255],
  [178, 102, 255],
  [255, 255, 255],
]

// Drags a horizontal or vertical strip into a 0-100 percentage — shared by the
// Used by the Tile (vertical) brightness-drag style.
function useDragToPercent(onChange: (pct: number) => void) {
  const ref = useRef<HTMLDivElement>(null)

  function start(e: ReactPointerEvent, vertical: boolean) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()

    function update(clientX: number, clientY: number) {
      const frac = vertical
        ? 1 - (clientY - rect.top) / rect.height
        : (clientX - rect.left) / rect.width
      onChange(Math.round(Math.max(0.02, Math.min(1, frac)) * 100))
    }
    update(e.clientX, e.clientY)

    function move(ev: PointerEvent) {
      update(ev.clientX, ev.clientY)
    }
    function up() {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
  }

  return { ref, start }
}

function TileLight({
  displayName,
  icon,
  isOn,
  color,
  brightnessPct,
  supportsBrightness,
  onToggle,
  onBrightnessChange,
}: {
  displayName: string
  icon: ReactElement
  isOn: boolean
  color: string
  brightnessPct: number
  supportsBrightness: boolean
  onToggle: () => void
  onBrightnessChange: (pct: number) => void
}) {
  const { t } = useTranslation()
  const drag = useDragToPercent(onBrightnessChange)

  return (
    <div
      ref={drag.ref}
      onPointerDown={(e) => {
        if (supportsBrightness) drag.start(e, true)
        else onToggle()
      }}
      className="relative flex h-40 cursor-pointer touch-none flex-col justify-between overflow-hidden rounded-2xl border p-4 select-none"
      style={{
        borderColor: isOn ? color : "var(--seam)",
        background: "#000",
        boxShadow: isOn
          ? `0 0 26px -6px ${color}`
          : "0 0 3px 0 rgba(0,0,0,1), 0 0 8px 2px rgba(0,0,0,0.8)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 transition-[height] duration-200"
        style={{
          height: isOn ? `${Math.max(brightnessPct, 8)}%` : 0,
          background: `linear-gradient(to top, ${color}, color-mix(in srgb, ${color} 45%, transparent))`,
        }}
      />
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation()
          onToggle()
        }}
        aria-pressed={isOn}
        className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center self-start rounded-full"
        style={{ background: "rgba(0,0,0,0.35)", color: isOn ? "var(--parchment)" : "var(--ash-dim)" }}
      >
        <div className="h-4 w-4">{icon}</div>
      </button>
      <div className="relative z-10">
        <div
          className="font-[family-name:var(--font-mono)] text-2xl"
          style={{ color: isOn && brightnessPct > 40 ? "var(--ink)" : "var(--parchment)" }}
        >
          {isOn ? (supportsBrightness ? `${brightnessPct}%` : t("common.on")) : t("common.off")}
        </div>
        <div
          className="truncate text-sm"
          style={{ color: isOn && brightnessPct > 40 ? "var(--ink)" : "var(--parchment)" }}
        >
          {displayName}
        </div>
      </div>
    </div>
  )
}

function WheelLight({
  displayName,
  icon,
  isOn,
  color,
  rgb,
  brightnessPct,
  supportsBrightness,
  onToggle,
  onBrightnessChange,
  onColorChange,
}: {
  displayName: string
  icon: ReactElement
  isOn: boolean
  color: string
  rgb: [number, number, number]
  brightnessPct: number
  supportsBrightness: boolean
  onToggle: () => void
  onBrightnessChange: (pct: number) => void
  onColorChange: (rgb: [number, number, number]) => void
}) {
  const { t } = useTranslation()
  const wheelRef = useRef<HTMLDivElement>(null)
  const size = 64
  const center = size / 2
  const maxRadius = center - 6
  const { h, s } = rgbToHsv(rgb[0], rgb[1], rgb[2])
  const angle = (h * Math.PI) / 180
  const radius = s * maxRadius
  const puckX = center + Math.cos(angle) * radius
  const puckY = center + Math.sin(angle) * radius

  function startColorDrag(e: ReactPointerEvent) {
    const el = wheelRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2

    function update(clientX: number, clientY: number) {
      const dx = clientX - cx
      const dy = clientY - cy
      let deg = (Math.atan2(dy, dx) * 180) / Math.PI
      if (deg < 0) deg += 360
      const dist = Math.min(1, Math.sqrt(dx * dx + dy * dy) / maxRadius)
      onColorChange(hsvToRgb(deg, dist, 1))
    }
    update(e.clientX, e.clientY)

    function move(ev: PointerEvent) {
      update(ev.clientX, ev.clientY)
    }
    function up() {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl border p-4 transition-all duration-500"
      style={{
        borderColor: isOn ? color : "rgba(255,255,255,0.09)",
        background: "#000",
        boxShadow: isOn ? `0 0 22px -8px ${color}` : "0 0 3px 0 rgba(0,0,0,1)",
      }}
    >
      <div className="mb-3 flex items-center gap-3">
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={isOn}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-500"
          style={{ background: "var(--ink)", color: isOn ? color : "var(--ash-dim)" }}
        >
          <div className="h-4 w-4">{icon}</div>
        </button>
        <div className="min-w-0 flex-1 truncate font-medium text-[var(--parchment)]">{displayName}</div>
      </div>

      <div className="flex items-center gap-4">
        <div
          ref={wheelRef}
          onPointerDown={(e) => isOn && startColorDrag(e)}
          className="relative shrink-0 touch-none rounded-full"
          style={{
            width: size,
            height: size,
            cursor: isOn ? "pointer" : "default",
            opacity: isOn ? 1 : 0.35,
            background:
              "conic-gradient(from 90deg, red, yellow, lime, cyan, blue, magenta, red), radial-gradient(circle, white, transparent 70%)",
            backgroundBlendMode: "screen",
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-black bg-white"
            style={{ left: puckX, top: puckY }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-[family-name:var(--font-mono)] text-xl" style={{ color: isOn ? color : "var(--ash-dim)" }}>
            {isOn ? (supportsBrightness ? `${brightnessPct}%` : t("common.on")) : t("common.off")}
          </div>
          {supportsBrightness && isOn && (
            <input
              type="range"
              min={1}
              max={100}
              value={brightnessPct}
              onChange={(e) => onBrightnessChange(Number(e.target.value))}
              className="ha-slider relative mt-2 w-full"
              style={
                {
                  background: `linear-gradient(to right, ${color} ${brightnessPct}%, var(--seam) ${brightnessPct}%)`,
                  "--slider-color": color,
                } as CSSProperties
              }
            />
          )}
        </div>
      </div>
    </div>
  )
}

export function LightTile({
  entityId,
  displayName,
  icon,
  style = "default",
}: {
  entityId: string
  displayName?: string
  icon?: ReactElement
  style?: LightCardStyle
}) {
  const entity = useEntity(entityId)
  const { callService } = useHomeAssistant()
  const { t } = useTranslation()
  const iconRef = useRef<HTMLDivElement>(null)
  const firstRender = useRef(true)
  const [showPalette, setShowPalette] = useState(false)

  const domain = entityId.split(".")[0]
  const isOn = entity?.state === "on"
  const attrs = entity?.attributes ?? {}

  const supportsBrightness = domain === "light" && typeof attrs.brightness === "number"
  const brightnessPct = supportsBrightness
    ? Math.round((Number(attrs.brightness) / 255) * 100)
    : 100

  const supportedColorModes = (attrs.supported_color_modes as string[] | undefined) ?? []
  const supportsColorTemp = supportedColorModes.includes("color_temp")
  const supportsColor = supportedColorModes.some((m) =>
    ["rgb", "rgbw", "rgbww", "hs", "xy"].includes(m),
  )
  const minKelvin = (attrs.min_color_temp_kelvin as number | undefined) ?? 2000
  const maxKelvin = (attrs.max_color_temp_kelvin as number | undefined) ?? 6500
  const currentKelvin = getCurrentKelvin(attrs) ?? Math.round((minKelvin + maxKelvin) / 2)

  function setBrightness(pct: number) {
    callService("light", "turn_on", { entity_id: entityId, brightness_pct: pct })
  }

  function setColorTemp(kelvin: number) {
    callService("light", "turn_on", { entity_id: entityId, color_temp_kelvin: kelvin })
  }

  const brightnessSlider = useLiveSlider(brightnessPct, setBrightness)
  const colorTempSlider = useLiveSlider(currentKelvin, setColorTemp)

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
  }, [isOn])

  if (!entity) return null

  const glowOpacity = isOn ? 0.16 + (brightnessPct / 100) * 0.4 : 0
  const accentColor = getLightAccentColor(attrs)
  const rgb = (attrs.rgb_color as [number, number, number] | undefined) ?? [255, 179, 71]
  const resolvedIcon = icon ?? getLightIcon(domain)
  const resolvedName = displayName ?? (entity.attributes.friendly_name as string | undefined) ?? entityId

  function toggle() {
    callService(domain, isOn ? "turn_off" : "turn_on", {
      entity_id: entityId,
    })
  }

  function setColor(rgbValue: [number, number, number]) {
    callService("light", "turn_on", {
      entity_id: entityId,
      rgb_color: rgbValue,
    })
  }

  if (style === "tile" && supportsBrightness) {
    return (
      <TileLight
        displayName={resolvedName}
        icon={resolvedIcon}
        isOn={isOn}
        color={accentColor}
        brightnessPct={brightnessSlider.value}
        supportsBrightness={supportsBrightness}
        onToggle={toggle}
        onBrightnessChange={brightnessSlider.onChange}
      />
    )
  }

  if (style === "wheel" && supportsColor) {
    return (
      <WheelLight
        displayName={resolvedName}
        icon={resolvedIcon}
        isOn={isOn}
        color={accentColor}
        rgb={rgb}
        brightnessPct={brightnessSlider.value}
        supportsBrightness={supportsBrightness}
        onToggle={toggle}
        onBrightnessChange={brightnessSlider.onChange}
        onColorChange={setColor}
      />
    )
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl border p-4 transition-all duration-500"
      style={{
        borderColor: isOn ? accentColor : "rgba(255,255,255,0.09)",
        background: "#000",
        boxShadow: isOn
          ? `0 0 26px -6px ${accentColor}`
          : "0 0 3px 0 rgba(0,0,0,1), 0 0 8px 2px rgba(0,0,0,0.8)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full blur-2xl transition-opacity duration-700"
        style={{
          background: accentColor,
          opacity: glowOpacity,
        }}
      />

      <div className="relative flex items-center gap-3">
        <div
          ref={iconRef}
          aria-hidden
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-500"
          style={{
            background: "var(--ink)",
            color: isOn ? accentColor : "var(--ash-dim)",
            filter: isOn ? `drop-shadow(0 0 5px ${accentColor})` : undefined,
          }}
        >
          <div className="h-4 w-4">{resolvedIcon}</div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-[var(--parchment)]">{resolvedName}</div>
          <div className="mt-0.5 font-[family-name:var(--font-mono)] text-xs text-[var(--ash)]">
            {isOn ? t("common.on") : t("common.off")}
            {isOn && supportsBrightness ? ` · ${brightnessSlider.value}%` : ""}
          </div>
        </div>

        <button
          type="button"
          onClick={toggle}
          aria-pressed={isOn}
          className="box-content flex h-5 w-9 shrink-0 items-center rounded-full border-0 p-0.5 transition-colors duration-300"
          style={{
            background: isOn ? accentColor : "var(--seam)",
            justifyContent: isOn ? "flex-end" : "flex-start",
          }}
        >
          <span className="block h-4 w-4 rounded-full bg-[var(--ink)] transition-transform duration-300" />
        </button>
      </div>

      {supportsBrightness && isOn && (
        <input
          type="range"
          min={1}
          max={100}
          value={brightnessSlider.value}
          onChange={(e) => brightnessSlider.onChange(Number(e.target.value))}
          className="ha-slider relative mt-3"
          style={
            {
              background: `linear-gradient(to right, ${accentColor} ${brightnessSlider.value}%, var(--seam) ${brightnessSlider.value}%)`,
              "--slider-color": accentColor,
            } as CSSProperties
          }
        />
      )}

      {supportsColorTemp && isOn && (
        <div className="relative mt-3 flex items-center gap-2">
          <div className="h-3.5 w-3.5 shrink-0 text-[var(--flame)]">
            <FlameIcon />
          </div>
          <input
            type="range"
            min={minKelvin}
            max={maxKelvin}
            value={colorTempSlider.value}
            onChange={(e) => colorTempSlider.onChange(Number(e.target.value))}
            className="ha-slider flex-1"
            style={
              {
                background: "linear-gradient(to right, var(--flame), #ffe3b3, #bcd7e8)",
                "--slider-color": accentColor,
              } as CSSProperties
            }
          />
          <div className="h-3.5 w-3.5 shrink-0 text-[#bcd7e8]">
            <SnowflakeIcon />
          </div>
        </div>
      )}

      {supportsColor && isOn && (
        <div className="relative mt-3">
          <button
            type="button"
            onClick={() => setShowPalette((v) => !v)}
            aria-expanded={showPalette}
            className="flex items-center gap-1 text-xs text-[var(--ash)] transition-colors hover:text-[var(--parchment)]"
          >
            <span
              className="flex h-3.5 w-3.5 shrink-0 transition-transform duration-200"
              style={{ transform: showPalette ? "rotate(180deg)" : "rotate(0deg)" }}
            >
              <ChevronDownIcon />
            </span>
            {t("light.colors")}
          </button>

          {showPalette && (
            <div className="mt-2 flex flex-wrap gap-2">
              {COLOR_PRESETS.map(([r, g, b]) => (
                <button
                  key={`${r}-${g}-${b}`}
                  type="button"
                  onClick={() => setColor([r, g, b])}
                  aria-label={t("light.colorAria", { r, g, b })}
                  className="h-5 w-5 shrink-0 rounded-full transition-transform hover:scale-110"
                  style={{
                    background: `rgb(${r}, ${g}, ${b})`,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.6), inset 0 0 0 1.5px rgba(255,255,255,0.25)",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
