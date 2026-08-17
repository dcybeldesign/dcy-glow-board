import type { TranslationKey } from "./i18n"

const ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
}

export function BulbIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z" />
    </svg>
  )
}

export function PlugIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M9 2v4" />
      <path d="M15 2v4" />
      <path d="M6 8h12v3a6 6 0 0 1-12 0z" />
      <path d="M12 17v5" />
    </svg>
  )
}

export function ThermometerIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M12 2a2 2 0 0 0-2 2v10.5a4 4 0 1 0 4 0V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="18" r="1.4" fill="currentColor" />
    </svg>
  )
}

export function DropletIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />
    </svg>
  )
}

export function BoltIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M13 2 4 14h6l-1 8 9-12h-6z" />
    </svg>
  )
}

export function ActivityIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M3 12h4l2-7 4 14 2-7h6" />
    </svg>
  )
}

export function BlindsIcon() {
  return (
    <svg {...ICON_PROPS}>
      <rect x="4" y="4" width="16" height="16" rx="1" />
      <path d="M4 9h16" />
      <path d="M4 14h16" />
    </svg>
  )
}

export function GarageIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M3 21V9l9-6 9 6v12" />
      <path d="M3 21h18" />
      <path d="M7 21v-8h10v8" />
    </svg>
  )
}

export function FanIcon() {
  return (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <path d="M12 12c0-3.5 2-6 4.5-6 2 0 2.5 2 1 3.5S13.5 12 12 12" />
      <path d="M12 12c-3.5 0-6-2-6-4.5 0-2 2-2.5 3.5-1S12 10.5 12 12" />
      <path d="M12 12c0 3.5-2 6-4.5 6-2 0-2.5-2-1-3.5S10.5 12 12 12" />
    </svg>
  )
}

export function LockClosedIcon() {
  return (
    <svg {...ICON_PROPS}>
      <rect x="5" y="11" width="14" height="9" rx="1.5" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  )
}

export function LockOpenIcon() {
  return (
    <svg {...ICON_PROPS}>
      <rect x="5" y="11" width="14" height="9" rx="1.5" />
      <path d="M8 11V7a4 4 0 0 1 7.5-2" />
    </svg>
  )
}

export function DoorIcon() {
  return (
    <svg {...ICON_PROPS}>
      <rect x="5" y="3" width="14" height="18" rx="1" />
      <path d="M9 12h.01" />
    </svg>
  )
}

export function EyeIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export function AlertTriangleIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M12 3 2 20h20L12 3z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="17" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function WifiIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M2 8.5a16 16 0 0 1 20 0" />
      <path d="M5.5 12.5a11 11 0 0 1 13 0" />
      <path d="M9 16.5a5.5 5.5 0 0 1 6 0" />
      <circle cx="12" cy="20" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function BatteryIcon() {
  return (
    <svg {...ICON_PROPS}>
      <rect x="2" y="8" width="17" height="8" rx="1.5" />
      <path d="M22 10.5v3" />
    </svg>
  )
}

export function ChevronDownIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

export function ChevronUpIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M6 15l6-6 6 6" />
    </svg>
  )
}

export function StopSquareIcon() {
  return (
    <svg {...ICON_PROPS}>
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  )
}

export function TapIcon() {
  return (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function WandIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M4 20 16 8" />
      <path d="M14 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" />
      <path d="M19 13l.7 1.3 1.3.7-1.3.7-.7 1.3-.7-1.3-1.3-.7 1.3-.7z" />
    </svg>
  )
}

export function PlayIcon() {
  return (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="12" r="9" />
      <path d="M10 8.5l6 3.5-6 3.5z" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function SnowflakeIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M12 2v20" />
      <path d="M4.9 7l14.2 10" />
      <path d="M19.1 7L4.9 17" />
    </svg>
  )
}

export function FlameIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M12 2s5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5-.2 1.8 1 2.5 1.5 2a3 3 0 0 0 .5-3.5C10.5 4.5 12 2 12 2z" />
    </svg>
  )
}

export function AutoModeIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  )
}

export function PowerIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M12 2v8" />
      <path d="M18.4 6.6a9 9 0 1 1-12.8 0" />
    </svg>
  )
}

export function SunIcon() {
  return (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M4.2 4.2l1.4 1.4" />
      <path d="M18.4 18.4l1.4 1.4" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="M4.2 19.8l1.4-1.4" />
      <path d="M18.4 5.6l1.4-1.4" />
    </svg>
  )
}

export function MoonIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
    </svg>
  )
}

export function CloudIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M7 18a4.5 4.5 0 0 1-.5-8.98A5.5 5.5 0 0 1 17.3 8.1 4 4 0 0 1 17 18H7z" />
    </svg>
  )
}

export function CloudSunIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M6.5 5.5V4" />
      <path d="M3.5 8.5H2" />
      <path d="M4.6 4.6l1 1" />
      <circle cx="7" cy="8" r="2.2" />
      <path d="M8 19a4 4 0 0 1-.4-7.98A5 5 0 0 1 17.2 9.1 3.5 3.5 0 0 1 17 16v0" />
      <path d="M9 19h8a3.5 3.5 0 0 0 0-7 5 5 0 0 0-8.2 3" />
    </svg>
  )
}

export function RainIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M7 15a4 4 0 0 1-.5-7.97A5 5 0 0 1 16.9 6.1 3.5 3.5 0 0 1 17 13H7z" />
      <path d="M8 18l-1 3" />
      <path d="M12 18l-1 3" />
      <path d="M16 18l-1 3" />
    </svg>
  )
}

export function SnowIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M7 13a4 4 0 0 1-.5-7.97A5 5 0 0 1 16.9 4.1 3.5 3.5 0 0 1 17 11H7z" />
      <path d="M8 17v.01" />
      <path d="M12 17v.01" />
      <path d="M16 17v.01" />
      <path d="M8 20v.01" />
      <path d="M12 20v.01" />
      <path d="M16 20v.01" />
    </svg>
  )
}

export function FogIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M4 8h16" />
      <path d="M6 12h12" />
      <path d="M3 16h18" />
      <path d="M7 20h10" />
    </svg>
  )
}

export function WindIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M3 8h10a2.5 2.5 0 1 0-2.5-2.5" />
      <path d="M3 12.5h14a2.5 2.5 0 1 1-2.5 2.5" />
      <path d="M3 17h8" />
    </svg>
  )
}

export function StormIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M7 12a4 4 0 0 1-.5-7.97A5 5 0 0 1 16.9 3.1 3.5 3.5 0 0 1 17 10H7z" />
      <path d="M13 12l-3 5h3l-2 4" />
    </svg>
  )
}

export function TvIcon() {
  return (
    <svg {...ICON_PROPS}>
      <rect x="3" y="5" width="18" height="12" rx="1.5" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
    </svg>
  )
}

export function SpeakerIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M4 9v6h4l5 4V5L8 9H4z" />
      <path d="M16.5 9.5a4 4 0 0 1 0 5" />
      <path d="M19 7a7 7 0 0 1 0 10" />
    </svg>
  )
}

export function CameraIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M4 8a1.5 1.5 0 0 1 1.5-1.5h2l1-2h7l1 2h2A1.5 1.5 0 0 1 20 8v9.5A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5z" />
      <circle cx="12" cy="12.5" r="3.5" />
    </svg>
  )
}

export function MediaPlayIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M8 6l10 6-10 6V6z" />
    </svg>
  )
}

export function MediaPauseIcon() {
  return (
    <svg {...ICON_PROPS}>
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  )
}

export function MediaNextIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M6 6l9 6-9 6V6z" />
      <path d="M18 6v12" />
    </svg>
  )
}

export function MediaPreviousIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M18 6L9 12l9 6V6z" />
      <path d="M6 6v12" />
    </svg>
  )
}

export function ReturnDockIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M12 21a8 8 0 1 1 8-8" />
      <path d="M12 21v-5" />
      <path d="M9 18l3-3 3 3" />
    </svg>
  )
}

export function BackspaceIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M8 5h12a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H8l-6-7z" />
      <path d="M12 10l5 5" />
      <path d="M17 10l-5 5" />
    </svg>
  )
}

export function CheckIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M5 12l5 5 9-10" />
    </svg>
  )
}

export function getMediaPlayerIcon(deviceClass: string | undefined) {
  if (deviceClass === "tv") return <TvIcon />
  return <SpeakerIcon />
}

export function VacuumIcon() {
  return (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 4v2" />
    </svg>
  )
}

export function ShieldIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M12 3l7 3v6c0 5-3.5 7.5-7 9-3.5-1.5-7-4-7-9V6z" />
      <path d="M9.5 12l2 2 3.5-4" />
    </svg>
  )
}

export function SirenIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M6 18a6 6 0 0 1 12 0z" />
      <path d="M4 18h16" />
      <path d="M12 8V5" />
    </svg>
  )
}

export function CalendarIcon() {
  return (
    <svg {...ICON_PROPS}>
      <rect x="3" y="5" width="18" height="16" rx="1.5" />
      <path d="M3 10h18" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
    </svg>
  )
}

export function TimerIcon() {
  return (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l3 2" />
      <path d="M9 2h6" />
    </svg>
  )
}

export function PersonIcon() {
  return (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="7" r="3.5" />
      <path d="M5 21c0-4 3-7 7-7s7 3 7 7" />
    </svg>
  )
}

export function CarIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M4 16V11l2-5h12l2 5v5" />
      <path d="M4 16h16" />
      <circle cx="7.5" cy="16.5" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="16.5" cy="16.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function GaugeIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M4 15a8 8 0 1 1 16 0" />
      <path d="M12 15l4-5" />
      <path d="M12 15v.01" />
    </svg>
  )
}

export function LungsIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M12 3v8" />
      <path d="M12 11c-1 3-3 3-4 3-2 0-3-2-3-5 0-2 1-4 2-5" />
      <path d="M12 11c1 3 3 3 4 3 2 0 3-2 3-5 0-2-1-4-2-5" />
    </svg>
  )
}

export function ValveIcon() {
  return (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="9" r="5" />
      <path d="M12 4V3" />
      <path d="M12 14v7" />
      <path d="M8 9h8" />
    </svg>
  )
}

export function UpdateIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M12 3v10" />
      <path d="M8 9l4 4 4-4" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  )
}

const CLIMATE_COLORS: Record<string, string> = {
  heat: "var(--coral)",
  heating: "var(--coral)",
  cool: "var(--frost)",
  cooling: "var(--frost)",
  dry: "var(--frost)",
  drying: "var(--frost)",
  auto: "var(--moss)",
  heat_cool: "var(--moss)",
  fan_only: "var(--ash-dim)",
  fan: "var(--ash-dim)",
  idle: "var(--ash-dim)",
  off: "var(--ash-dim)",
}

export function getClimateColor(mode: string): string {
  return CLIMATE_COLORS[mode] ?? "var(--ash-dim)"
}

export function getClimateModeIcon(mode: string) {
  if (mode === "heat") return <FlameIcon />
  if (mode === "cool") return <SnowflakeIcon />
  if (mode === "auto" || mode === "heat_cool") return <AutoModeIcon />
  if (mode === "dry") return <DropletIcon />
  if (mode === "fan_only") return <ActivityIcon />
  return <PowerIcon />
}

export function getLightIcon(domain: string) {
  return domain === "switch" ? <PlugIcon /> : <BulbIcon />
}

export function getCurrentKelvin(attrs: Record<string, unknown>): number | undefined {
  const kelvin = attrs.color_temp_kelvin as number | undefined
  if (typeof kelvin === "number") return kelvin
  const mireds = attrs.color_temp as number | undefined
  if (typeof mireds === "number" && mireds > 0) {
    return Math.round(1_000_000 / mireds)
  }
  return undefined
}

export function getLightAccentColor(attrs: Record<string, unknown>): string {
  const rgb = attrs.rgb_color as [number, number, number] | undefined
  if (Array.isArray(rgb) && rgb.length === 3) {
    return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
  }
  const kelvin = getCurrentKelvin(attrs)
  if (typeof kelvin === "number") {
    if (kelvin <= 3000) return "var(--flame)"
    if (kelvin >= 5000) return "#bcd7e8"
    return "#ffe3b3"
  }
  return "var(--flame)"
}

export function getCoverIcon(deviceClass: string | undefined) {
  return deviceClass === "garage" ? <GarageIcon /> : <BlindsIcon />
}

const ALERT_BINARY_CLASSES = new Set([
  "moisture",
  "smoke",
  "gas",
  "co",
  "co2",
  "problem",
  "safety",
  "battery",
  "tamper",
])
const INVERSE_BINARY_CLASSES = new Set(["connectivity"])
const BINARY_CLASSES_WITH_LABELS = new Set([
  "door",
  "garage_door",
  "window",
  "opening",
  "motion",
  "occupancy",
  "presence",
  "moisture",
  "smoke",
  "gas",
  "co",
  "problem",
  "safety",
  "battery",
  "tamper",
  "connectivity",
  "plug",
  "power",
  "lock",
])

export function getBinarySensorLabel(
  deviceClass: string | undefined,
  isOn: boolean,
  t: (key: TranslationKey) => string,
) {
  const key = BINARY_CLASSES_WITH_LABELS.has(deviceClass ?? "") ? deviceClass : "default"
  const label = t(`binary.${key}.${isOn ? "on" : "off"}` as TranslationKey)
  const inverse = INVERSE_BINARY_CLASSES.has(deviceClass ?? "")
  const alertActive = inverse ? !isOn : isOn
  const alert = ALERT_BINARY_CLASSES.has(deviceClass ?? "") && alertActive
  return { label, alert }
}

export function getBinarySensorIcon(deviceClass: string | undefined) {
  if (
    deviceClass === "door" ||
    deviceClass === "garage_door" ||
    deviceClass === "window" ||
    deviceClass === "opening"
  ) {
    return <DoorIcon />
  }
  if (deviceClass === "motion" || deviceClass === "occupancy" || deviceClass === "presence") {
    return <EyeIcon />
  }
  if (deviceClass === "moisture") return <DropletIcon />
  if (
    deviceClass === "smoke" ||
    deviceClass === "gas" ||
    deviceClass === "co" ||
    deviceClass === "co2" ||
    deviceClass === "problem" ||
    deviceClass === "safety" ||
    deviceClass === "tamper"
  ) {
    return <AlertTriangleIcon />
  }
  if (deviceClass === "connectivity") return <WifiIcon />
  if (deviceClass === "battery") return <BatteryIcon />
  if (deviceClass === "plug" || deviceClass === "power") return <PlugIcon />
  if (deviceClass === "lock") return <LockOpenIcon />
  return <ActivityIcon />
}

export function getActionIcon(domain: string) {
  if (domain === "scene") return <WandIcon />
  if (domain === "script") return <PlayIcon />
  return <TapIcon />
}

export function getSensorIcon(
  deviceClass: string | undefined,
  unit: string | undefined,
) {
  if (deviceClass === "temperature" || unit === "°C" || unit === "°F") {
    return <ThermometerIcon />
  }
  if (deviceClass === "humidity" || unit === "%") {
    return <DropletIcon />
  }
  if (
    deviceClass === "power" ||
    deviceClass === "energy" ||
    deviceClass === "current" ||
    deviceClass === "voltage"
  ) {
    return <BoltIcon />
  }
  return <ActivityIcon />
}

export function getSensorValueColor(
  deviceClass: string | undefined,
  unit: string | undefined,
  value: number,
): string | undefined {
  if (!Number.isFinite(value)) return undefined

  const isTemperature = deviceClass === "temperature" || unit === "°C" || unit === "°F"
  if (isTemperature) {
    if (value >= 26) return "var(--coral)"
    if (value <= 16) return "var(--frost)"
    return undefined
  }

  const isHumidity = deviceClass === "humidity" || unit === "%"
  if (isHumidity) {
    if (value >= 65) return "var(--frost)"
    if (value <= 30) return "var(--flame)"
    return undefined
  }

  return undefined
}
