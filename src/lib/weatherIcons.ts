import type { TranslationKey } from "./i18n"

const KNOWN_CONDITIONS = new Set([
  "clear-night",
  "cloudy",
  "fog",
  "hail",
  "lightning",
  "lightning-rainy",
  "partlycloudy",
  "pouring",
  "rainy",
  "snowy",
  "snowy-rainy",
  "sunny",
  "windy",
  "windy-variant",
  "exceptional",
])

// `exceptional` has no dedicated icon in the source pack — falls back to `cloudy`.
const CONDITION_ICON_FILES: Record<string, string> = {
  "clear-night": "clear-night",
  cloudy: "cloudy",
  fog: "fog",
  hail: "hail",
  lightning: "lightning",
  "lightning-rainy": "lightning-rainy",
  partlycloudy: "partlycloudy",
  pouring: "pouring",
  rainy: "rainy",
  snowy: "snowy",
  "snowy-rainy": "snowy-rainy",
  sunny: "sunny",
  windy: "windy",
  "windy-variant": "windy-variant",
  exceptional: "cloudy",
}

// One representative color per condition — some intentionally share a hue
// family (e.g. rainy/pouring, windy/windy-variant) rather than being forced
// distinct.
const CONDITION_COLORS: Record<string, string> = {
  sunny: "#ffb347",
  "clear-night": "#5b6ea8",
  partlycloudy: "#d9a441",
  cloudy: "#8c98a4",
  fog: "#a9b0ac",
  windy: "#7ec8e3",
  "windy-variant": "#8aa9c9",
  rainy: "#6fb7c9",
  pouring: "#3d7a8c",
  hail: "#a8c5d1",
  snowy: "#bcd7e8",
  "snowy-rainy": "#8fb8c9",
  lightning: "#f0c419",
  "lightning-rainy": "#8f6fae",
  exceptional: "#e08585",
}

export function getWeatherColor(condition: string | undefined): string {
  return (condition && CONDITION_COLORS[condition]) || "#8c98a4"
}

export function getWeatherIconUrl(condition: string | undefined): string {
  const file = (condition && CONDITION_ICON_FILES[condition]) || "cloudy"
  return `${import.meta.env.BASE_URL}weather-icons/${file}.svg`
}

export function getWeatherLabel(
  condition: string | undefined,
  t: (key: TranslationKey) => string,
): string {
  if (condition && KNOWN_CONDITIONS.has(condition)) {
    return t(`weather.condition.${condition}` as TranslationKey)
  }
  return condition || t("weather.unknown")
}
