const STORAGE_KEY = "ha-dashboard-config-v1"

// entity_id -> explicit grid cell. Cards absent from this map auto-flow into
// the next free cell after the highest explicitly-placed row, preserving any
// gaps the user left on purpose.
export type CardLayout = Record<string, { row: number; col: number }>

export type AreaTabConfig = {
  id: string
  kind: "area"
  visible: boolean
  // Explicit override of which cards to show, in order. Undefined = automatic
  // (every entity HA has assigned to this area) — stays future-proof until
  // the user customizes this tab's cards from Réglages.
  cardIds?: string[]
  layout?: CardLayout
}

export type CardSection = {
  id: string
  name: string
  cardIds: string[]
  layout?: CardLayout
}

export type CustomTabConfig = {
  id: string
  kind: "custom"
  name: string
  visible: boolean
  cardIds: string[]
  layout?: CardLayout
  // When sectioned, the tab renders as stacked named sub-groups instead of
  // one flat grid — cardIds is preserved but ignored so toggling back off
  // restores the flat view without losing anything.
  sectioned?: boolean
  sections?: CardSection[]
}

// A tab that embeds an arbitrary web page (Music Assistant, ESPHome, an IP
// camera's own web UI, ...) in an iframe, full-width, instead of a card grid
// — not tied to any HA entity/domain, so it works for any user's setup.
export type IframeTabConfig = {
  id: string
  kind: "iframe"
  name: string
  visible: boolean
  url: string
}

export type TabConfig = AreaTabConfig | CustomTabConfig | IframeTabConfig

export type WeatherCardView = "day" | "hour" | "week"
export type CardColSpan = 1 | 2 | 3
export type SensorCardStyle = "default" | "arc" | "needle" | "thermometer" | "ring"
export type SensorRange = { min: number; max: number }
export type LightCardStyle = "default" | "tile" | "wheel"
export type ClimateCardStyle = "default" | "compact"
export type CoverCardStyle = "default" | "tile"
export type LockCardStyle = "default" | "slide"
export type BinarySensorCardStyle = "default" | "timeline"
export type RoomSummaryStyle = "text" | "card"
export type MediaPlayerCardStyle = "default" | "tile" | "art"
export type CameraCardStyle = "default" | "preview"
export type AlarmCardStyle = "default" | "keypad"
export type VacuumCardStyle = "default" | "tile"

export type DashboardConfig = {
  tabs: TabConfig[]
  // entity_id -> custom display name, overriding HA's friendly_name in this app only
  cardNames: Record<string, string>
  // entity_id -> icon catalog id, overriding the domain-derived default icon
  cardIcons: Record<string, string>
  // tab id -> icon catalog id, overriding the name-derived default icon
  tabIcons: Record<string, string>
  // tab id -> hex color, overriding the palette-derived default color
  tabColors: Record<string, string>
  // weather entity_id -> "day" (current conditions only) or "week" (+ 7-day forecast strip)
  cardWeatherView: Record<string, WeatherCardView>
  // entity_id -> how many grid columns the card spans (1-3), overriding the 1-column default
  cardColSpan: Record<string, CardColSpan>
  // sensor entity_id -> visual style for the value ("default" = big number + sparkline)
  cardSensorStyle: Record<string, SensorCardStyle>
  // sensor entity_id -> manual min/max for gauge styles, overriding the guessed range
  cardSensorRange: Record<string, SensorRange>
  // light/switch entity_id -> visual style ("default" = current horizontal-bar card)
  cardLightStyle: Record<string, LightCardStyle>
  // climate entity_id -> visual style ("default" = circular dial, "compact" = single row)
  cardClimateStyle: Record<string, ClimateCardStyle>
  // cover entity_id -> visual style ("default" = buttons + slider, "tile" = draggable window graphic)
  cardCoverStyle: Record<string, CoverCardStyle>
  // lock entity_id -> visual style ("default" = tap button, "slide" = slide-to-unlock)
  cardLockStyle: Record<string, LockCardStyle>
  // binary_sensor entity_id -> visual style ("default" = icon + label, "timeline" = 12h history strip)
  cardBinarySensorStyle: Record<string, BinarySensorCardStyle>
  // tab (or section) id -> room header style ("text" = current one-line summary, "card" = enriched stats card)
  roomSummaryStyle: Record<string, RoomSummaryStyle>
  // media_player entity_id -> visual style ("default" = compact row, "tile" = remote-style buttons, "art" = artwork background)
  cardMediaPlayerStyle: Record<string, MediaPlayerCardStyle>
  // camera entity_id -> visual style ("default" = icon + state, "preview" = refreshed snapshot + lightbox)
  cardCameraStyle: Record<string, CameraCardStyle>
  // alarm_control_panel entity_id -> visual style ("default" = mode chips, "keypad" = always-visible code pad)
  cardAlarmStyle: Record<string, AlarmCardStyle>
  // vacuum entity_id -> visual style ("default" = compact row, "tile" = battery ring gauge)
  cardVacuumStyle: Record<string, VacuumCardStyle>
}

function emptyConfig(): DashboardConfig {
  return {
    tabs: [],
    cardNames: {},
    cardIcons: {},
    tabIcons: {},
    tabColors: {},
    cardWeatherView: {},
    cardColSpan: {},
    cardSensorStyle: {},
    cardSensorRange: {},
    cardLightStyle: {},
    cardClimateStyle: {},
    cardCoverStyle: {},
    cardLockStyle: {},
    cardBinarySensorStyle: {},
    roomSummaryStyle: {},
    cardMediaPlayerStyle: {},
    cardCameraStyle: {},
    cardAlarmStyle: {},
    cardVacuumStyle: {},
  }
}

function normalizeConfig(parsed: unknown): DashboardConfig {
  const p = (parsed && typeof parsed === "object" ? parsed : {}) as Record<string, unknown>
  return {
    tabs: Array.isArray(p.tabs) ? (p.tabs as TabConfig[]) : [],
    cardNames: p.cardNames && typeof p.cardNames === "object" ? (p.cardNames as Record<string, string>) : {},
    cardIcons: p.cardIcons && typeof p.cardIcons === "object" ? (p.cardIcons as Record<string, string>) : {},
    tabIcons: p.tabIcons && typeof p.tabIcons === "object" ? (p.tabIcons as Record<string, string>) : {},
    tabColors: p.tabColors && typeof p.tabColors === "object" ? (p.tabColors as Record<string, string>) : {},
    cardWeatherView:
      p.cardWeatherView && typeof p.cardWeatherView === "object"
        ? (p.cardWeatherView as Record<string, WeatherCardView>)
        : {},
    cardColSpan:
      p.cardColSpan && typeof p.cardColSpan === "object"
        ? (p.cardColSpan as Record<string, CardColSpan>)
        : {},
    cardSensorStyle:
      p.cardSensorStyle && typeof p.cardSensorStyle === "object"
        ? (p.cardSensorStyle as Record<string, SensorCardStyle>)
        : {},
    cardSensorRange:
      p.cardSensorRange && typeof p.cardSensorRange === "object"
        ? (p.cardSensorRange as Record<string, SensorRange>)
        : {},
    cardLightStyle:
      p.cardLightStyle && typeof p.cardLightStyle === "object"
        ? (p.cardLightStyle as Record<string, LightCardStyle>)
        : {},
    cardClimateStyle:
      p.cardClimateStyle && typeof p.cardClimateStyle === "object"
        ? (p.cardClimateStyle as Record<string, ClimateCardStyle>)
        : {},
    cardCoverStyle:
      p.cardCoverStyle && typeof p.cardCoverStyle === "object"
        ? (p.cardCoverStyle as Record<string, CoverCardStyle>)
        : {},
    cardLockStyle:
      p.cardLockStyle && typeof p.cardLockStyle === "object"
        ? (p.cardLockStyle as Record<string, LockCardStyle>)
        : {},
    cardBinarySensorStyle:
      p.cardBinarySensorStyle && typeof p.cardBinarySensorStyle === "object"
        ? (p.cardBinarySensorStyle as Record<string, BinarySensorCardStyle>)
        : {},
    roomSummaryStyle:
      p.roomSummaryStyle && typeof p.roomSummaryStyle === "object"
        ? (p.roomSummaryStyle as Record<string, RoomSummaryStyle>)
        : {},
    cardMediaPlayerStyle:
      p.cardMediaPlayerStyle && typeof p.cardMediaPlayerStyle === "object"
        ? (p.cardMediaPlayerStyle as Record<string, MediaPlayerCardStyle>)
        : {},
    cardCameraStyle:
      p.cardCameraStyle && typeof p.cardCameraStyle === "object"
        ? (p.cardCameraStyle as Record<string, CameraCardStyle>)
        : {},
    cardAlarmStyle:
      p.cardAlarmStyle && typeof p.cardAlarmStyle === "object"
        ? (p.cardAlarmStyle as Record<string, AlarmCardStyle>)
        : {},
    cardVacuumStyle:
      p.cardVacuumStyle && typeof p.cardVacuumStyle === "object"
        ? (p.cardVacuumStyle as Record<string, VacuumCardStyle>)
        : {},
  }
}

export function loadConfig(): DashboardConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyConfig()
    return normalizeConfig(JSON.parse(raw))
  } catch {
    return emptyConfig()
  }
}

export function saveConfig(config: DashboardConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

// Returns null if the file isn't valid JSON — the caller decides how to surface that.
// Malformed/missing fields inside otherwise-valid JSON fall back field-by-field via
// normalizeConfig, same as loadConfig does for a corrupted localStorage entry.
export function parseConfigJson(json: string): DashboardConfig | null {
  try {
    return normalizeConfig(JSON.parse(json))
  } catch {
    return null
  }
}
