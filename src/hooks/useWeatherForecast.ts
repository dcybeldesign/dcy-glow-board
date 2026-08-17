import { useEffect, useState } from "react"
import { useHomeAssistant } from "./useHomeAssistant"
import type { WeatherForecastDay, WeatherForecastType } from "../context/homeAssistantContext"

// `forecastType` null avoids opening a forecast subscription for every weather
// card on every dashboard load — most stay on the default "day" view and never
// need it.
export function useWeatherForecast(
  entityId: string,
  forecastType: WeatherForecastType | null,
): WeatherForecastDay[] {
  const { status, subscribeForecast } = useHomeAssistant()
  const [forecast, setForecast] = useState<WeatherForecastDay[]>([])

  useEffect(() => {
    if (!forecastType || status !== "connected") {
      setForecast([])
      return
    }

    let cancelled = false
    let unsubscribe: (() => void) | undefined

    subscribeForecast(entityId, forecastType, (next) => {
      if (!cancelled) setForecast(next)
    })
      .then((unsub) => {
        if (cancelled) unsub()
        else unsubscribe = unsub
      })
      .catch(() => {
        // Older HA core, or a weather integration without this forecast type:
        // the card just stays on its current-conditions view.
      })

    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [forecastType, status, entityId, subscribeForecast])

  return forecast
}
