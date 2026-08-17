import { useEntity } from "../hooks/useEntity"
import { useWeatherForecast } from "../hooks/useWeatherForecast"
import { useTranslation } from "../hooks/useTranslation"
import { useUnits } from "../hooks/useUnits"
import { getWeatherColor, getWeatherIconUrl, getWeatherLabel } from "../lib/weatherIcons"
import { GlowCard } from "./GlowCard"
import type { WeatherForecastType } from "../context/homeAssistantContext"

const FORECAST_TYPE_BY_VIEW: Record<"day" | "hour" | "week", WeatherForecastType | null> = {
  day: null,
  hour: "hourly",
  week: "daily",
}

export function WeatherTile({
  entityId,
  displayName,
  view = "day",
}: {
  entityId: string
  displayName?: string
  view?: "day" | "hour" | "week"
}) {
  const entity = useEntity(entityId)
  const forecast = useWeatherForecast(entityId, FORECAST_TYPE_BY_VIEW[view])
  const { t, language } = useTranslation()
  const { convert } = useUnits()
  const locale = language === "fr" ? "fr-FR" : "en-US"
  const dayLabelFormat = new Intl.DateTimeFormat(locale, { weekday: "short" })
  const hourLabelFormat = new Intl.DateTimeFormat(locale, { hour: "2-digit", hour12: false })
  if (!entity) return null

  const attrs = entity.attributes as Record<string, unknown>
  const rawTempUnit = (attrs.temperature_unit as string | undefined) ?? "°C"
  const rawTemperature = attrs.temperature as number | undefined
  const temp = rawTemperature !== undefined ? convert(rawTemperature, rawTempUnit) : undefined
  const humidity = attrs.humidity as number | undefined
  const rawWindUnit = attrs.wind_speed_unit as string | undefined
  const rawWindSpeed = attrs.wind_speed as number | undefined
  const wind = rawWindSpeed !== undefined ? convert(rawWindSpeed, rawWindUnit) : undefined
  const color = getWeatherColor(entity.state)

  return (
    <GlowCard active color={color} intensity={0.24}>
      <div className="flex items-center gap-3">
        <img
          src={getWeatherIconUrl(entity.state)}
          alt=""
          aria-hidden
          className="h-14 w-14 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-[var(--parchment)]">
            {displayName ?? entity.attributes.friendly_name ?? entityId}
          </div>
          <div className="mt-0.5 text-xs text-[var(--ash)]">{getWeatherLabel(entity.state, t)}</div>
        </div>
        {temp !== undefined && (
          <div
            className="shrink-0 font-[family-name:var(--font-mono)] text-2xl"
            style={{ color }}
          >
            {Math.round(temp.value)}
            <span className="text-sm text-[var(--ash)]">{temp.unit}</span>
          </div>
        )}
      </div>
      {(humidity !== undefined || wind !== undefined) && (
        <div className="mt-3 flex gap-4 font-[family-name:var(--font-mono)] text-xs text-[var(--ash)]">
          {humidity !== undefined && <div>{t("weather.humidity", { n: humidity })}</div>}
          {wind !== undefined && <div>{t("weather.wind", { speed: wind.value, unit: wind.unit })}</div>}
        </div>
      )}

      {view === "hour" && forecast.length > 0 && (
        <div
          className="mt-4 flex gap-3 overflow-x-auto border-t pt-3"
          style={{ borderColor: "var(--seam)" }}
        >
          {forecast.slice(0, 12).map((hour) => {
            const hourTemp = hour.temperature !== undefined ? convert(hour.temperature, rawTempUnit) : undefined
            return (
              <div key={hour.datetime} className="flex shrink-0 flex-col items-center gap-1">
                <div className="font-[family-name:var(--font-mono)] text-[10px] text-[var(--ash-dim)]">
                  {language === "fr"
                    ? hourLabelFormat.format(new Date(hour.datetime)).replace(/\s?h?$/i, "h")
                    : hourLabelFormat.format(new Date(hour.datetime))}
                </div>
                <img
                  src={getWeatherIconUrl(hour.condition)}
                  alt=""
                  aria-hidden
                  className="h-5 w-5"
                />
                {hourTemp !== undefined && (
                  <div
                    className="font-[family-name:var(--font-mono)] text-[11px]"
                    style={{ color }}
                  >
                    {Math.round(hourTemp.value)}°
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {view === "week" && forecast.length > 0 && (
        <div
          className="mt-4 grid gap-1 border-t pt-3"
          style={{
            borderColor: "var(--seam)",
            gridTemplateColumns: `repeat(${Math.min(forecast.length, 7)}, minmax(0,1fr))`,
          }}
        >
          {forecast.slice(0, 7).map((day) => {
            const dayTemp = day.temperature !== undefined ? convert(day.temperature, rawTempUnit) : undefined
            const dayTempLow = day.templow !== undefined ? convert(day.templow, rawTempUnit) : undefined
            return (
              <div key={day.datetime} className="flex flex-col items-center gap-1">
                <div className="text-[10px] uppercase text-[var(--ash-dim)]">
                  {dayLabelFormat.format(new Date(day.datetime)).replace(".", "")}
                </div>
                <img
                  src={getWeatherIconUrl(day.condition)}
                  alt=""
                  aria-hidden
                  className="h-6 w-6"
                />
                <div className="flex items-baseline gap-1 font-[family-name:var(--font-mono)] text-[11px]">
                  {dayTemp !== undefined && <span style={{ color }}>{Math.round(dayTemp.value)}°</span>}
                  {dayTempLow !== undefined && (
                    <span className="text-[var(--ash-dim)]">{Math.round(dayTempLow.value)}°</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </GlowCard>
  )
}
