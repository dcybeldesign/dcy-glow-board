export type UnitSystem = "auto" | "metric" | "imperial"

export type ConvertedValue = { value: number; unit: string }

function round1(n: number): number {
  return Math.round(n * 10) / 10
}

const FAHRENHEIT_PATTERN = /f$/i
const MPH_PATTERN = /mph/i
const MILES_PATTERN = /^mi$/i
const FEET_PATTERN = /^ft$/i

export function convertTemperature(
  value: number,
  unit: string | undefined,
  system: UnitSystem,
): ConvertedValue {
  const sourceUnit = unit ?? "°C"
  if (system === "auto") return { value, unit: sourceUnit }

  const isFahrenheit = FAHRENHEIT_PATTERN.test(sourceUnit)
  if (system === "imperial") {
    if (isFahrenheit) return { value, unit: "°F" }
    return { value: round1((value * 9) / 5 + 32), unit: "°F" }
  }
  if (!isFahrenheit) return { value, unit: "°C" }
  return { value: round1(((value - 32) * 5) / 9), unit: "°C" }
}

export function convertSpeed(
  value: number,
  unit: string | undefined,
  system: UnitSystem,
): ConvertedValue {
  const sourceUnit = unit ?? "km/h"
  if (system === "auto") return { value, unit: sourceUnit }

  const isMph = MPH_PATTERN.test(sourceUnit)
  if (system === "imperial") {
    if (isMph) return { value, unit: "mph" }
    return { value: round1(value * 0.621371), unit: "mph" }
  }
  if (!isMph) return { value, unit: sourceUnit || "km/h" }
  return { value: round1(value / 0.621371), unit: "km/h" }
}

export function convertDistance(
  value: number,
  unit: string | undefined,
  system: UnitSystem,
): ConvertedValue {
  const sourceUnit = unit ?? "km"
  if (system === "auto") return { value, unit: sourceUnit }

  const isImperialUnit = MILES_PATTERN.test(sourceUnit) || FEET_PATTERN.test(sourceUnit)
  const isFeet = FEET_PATTERN.test(sourceUnit)
  if (system === "imperial") {
    if (isImperialUnit) return { value, unit: sourceUnit }
    return isFeet
      ? { value, unit: sourceUnit }
      : { value: round1(value * 0.621371), unit: "mi" }
  }
  if (!isImperialUnit) return { value, unit: sourceUnit || "km" }
  if (isFeet) return { value: round1(value * 0.3048), unit: "m" }
  return { value: round1(value / 0.621371), unit: "km" }
}

// Dispatches on the unit string itself so callers (weather, generic sensors)
// don't need to know in advance what kind of quantity a unit represents.
export function convertByUnit(
  value: number,
  unit: string | undefined,
  system: UnitSystem,
): ConvertedValue {
  if (system === "auto" || !Number.isFinite(value)) return { value, unit: unit ?? "" }
  if (unit === "°C" || unit === "°F") return convertTemperature(value, unit, system)
  if (unit === "km/h" || MPH_PATTERN.test(unit ?? "")) return convertSpeed(value, unit, system)
  if (unit === "km" || MILES_PATTERN.test(unit ?? "") || unit === "m" || FEET_PATTERN.test(unit ?? "")) {
    return convertDistance(value, unit, system)
  }
  return { value, unit: unit ?? "" }
}
