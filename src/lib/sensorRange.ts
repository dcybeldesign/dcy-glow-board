// Best-effort min/max domain for a sensor gauge. Known device classes get a
// sensible fixed range; anything else falls back to the observed 24h history
// (padded a bit) so gauges still make sense for sensors this app doesn't know about.

type Range = { min: number; max: number }

const DEVICE_CLASS_RANGES: Record<string, Range> = {
  temperature: { min: -10, max: 40 },
  humidity: { min: 0, max: 100 },
  battery: { min: 0, max: 100 },
  pressure: { min: 950, max: 1050 },
  co2: { min: 400, max: 2000 },
  illuminance: { min: 0, max: 1000 },
}

function historyFallback(value: number, historyValues: number[]): Range {
  const values = historyValues.length > 0 ? historyValues : [value]
  const min = Math.min(...values, value)
  const max = Math.max(...values, value)
  if (min === max) {
    // Flat history (or a single point) — pad around the value so the gauge
    // isn't a single fixed point regardless of what comes in next.
    const pad = Math.max(Math.abs(value) * 0.2, 1)
    return { min: value - pad, max: value + pad }
  }
  const pad = (max - min) * 0.15
  return { min: min - pad, max: max + pad }
}

export function getSensorRange(
  deviceClass: string | undefined,
  unit: string | undefined,
  value: number,
  historyValues: number[],
): Range {
  if (deviceClass && DEVICE_CLASS_RANGES[deviceClass]) return DEVICE_CLASS_RANGES[deviceClass]
  if (unit === "%") return DEVICE_CLASS_RANGES.humidity
  if (unit === "°C" || unit === "°F") return DEVICE_CLASS_RANGES.temperature
  return historyFallback(value, historyValues)
}
