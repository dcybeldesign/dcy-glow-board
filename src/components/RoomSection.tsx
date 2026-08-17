import { useHomeAssistant } from "../hooks/useHomeAssistant"
import { useTranslation } from "../hooks/useTranslation"
import type { CardLayout, DashboardConfigApi } from "../hooks/useDashboardConfig"
import { BlindsIcon, BulbIcon, DropletIcon, ThermometerIcon, getBinarySensorLabel } from "../lib/deviceIcons"
import { CardGrid } from "./CardGrid"
import { RoomSummaryCard, type RoomIssue, type RoomStat } from "./RoomSummaryCard"

function useSummary(entityIds: string[]): string | null {
  const { entities } = useHomeAssistant()
  const { t } = useTranslation()
  const parts: string[] = []

  const lightIds = entityIds.filter((id) => {
    const domain = id.split(".")[0]
    return domain === "light" || domain === "switch"
  })
  const lightsOn = lightIds.filter((id) => entities[id]?.state === "on").length
  if (lightIds.length > 0) {
    parts.push(lightsOn > 0 ? t("room.lightsOn", { n: lightsOn }) : t("room.lightsOff"))
  }

  const firstClimate = entityIds
    .filter((id) => id.split(".")[0] === "climate")
    .map((id) => entities[id])
    .find((e) => e && typeof e.attributes.current_temperature === "number")
  if (firstClimate) {
    parts.push(`${firstClimate.attributes.current_temperature}°C`)
  }

  return parts.length > 0 ? parts.join(" · ") : null
}

// Same aggregation as useSummary, but as structured stats + alerts for the
// enriched card style — stats shown adapt to whichever domains are actually
// present in the room, so a room without covers just skips that stat.
function useRoomStats(entityIds: string[]): { stats: RoomStat[]; issues: RoomIssue[] } {
  const { entities } = useHomeAssistant()
  const { t } = useTranslation()
  const stats: RoomStat[] = []
  const issues: RoomIssue[] = []

  const lightIds = entityIds.filter((id) => {
    const domain = id.split(".")[0]
    return domain === "light" || domain === "switch"
  })
  if (lightIds.length > 0) {
    const on = lightIds.filter((id) => entities[id]?.state === "on").length
    stats.push({
      icon: <BulbIcon />,
      value: `${on}/${lightIds.length}`,
      label: t("room.statLights"),
      color: "var(--flame)",
    })
  }

  const climateEntity = entityIds
    .filter((id) => id.split(".")[0] === "climate")
    .map((id) => entities[id])
    .find((e) => e && typeof e.attributes.current_temperature === "number")

  if (climateEntity) {
    stats.push({
      icon: <ThermometerIcon />,
      value: `${climateEntity.attributes.current_temperature}°C`,
      label: t("room.statTemperature"),
      color: "var(--coral)",
    })
    if (typeof climateEntity.attributes.current_humidity === "number") {
      stats.push({
        icon: <DropletIcon />,
        value: `${climateEntity.attributes.current_humidity}%`,
        label: t("room.statHumidity"),
        color: "var(--frost)",
      })
    }
  } else {
    const tempSensor = entityIds
      .filter((id) => id.split(".")[0] === "sensor")
      .map((id) => entities[id])
      .find((e) => e && e.attributes.device_class === "temperature")
    if (tempSensor) {
      const unit = (tempSensor.attributes.unit_of_measurement as string | undefined) ?? "°C"
      stats.push({
        icon: <ThermometerIcon />,
        value: `${tempSensor.state}${unit}`,
        label: t("room.statTemperature"),
        color: "var(--coral)",
      })
    }
    const humiditySensor = entityIds
      .filter((id) => id.split(".")[0] === "sensor")
      .map((id) => entities[id])
      .find((e) => e && e.attributes.device_class === "humidity")
    if (humiditySensor) {
      stats.push({
        icon: <DropletIcon />,
        value: `${humiditySensor.state}%`,
        label: t("room.statHumidity"),
        color: "var(--frost)",
      })
    }
  }

  const coverIds = entityIds.filter((id) => id.split(".")[0] === "cover")
  if (coverIds.length > 0) {
    const closed = coverIds.filter((id) => entities[id]?.state === "closed").length
    const value =
      closed === coverIds.length
        ? t("room.coversClosed")
        : closed === 0
          ? t("room.coversOpen")
          : t("room.coversOpenCount", { n: coverIds.length - closed })
    stats.push({ icon: <BlindsIcon />, value, label: t("room.statCovers"), color: "var(--ash)" })
  }

  const binaryIds = entityIds.filter((id) => id.split(".")[0] === "binary_sensor")
  for (const id of binaryIds) {
    const entity = entities[id]
    if (!entity) continue
    const isOn = entity.state === "on"
    const { label, alert } = getBinarySensorLabel(entity.attributes.device_class as string | undefined, isOn, t)
    if (alert) {
      issues.push({
        entityId: id,
        name: (entity.attributes.friendly_name as string | undefined) ?? id,
        label,
      })
    }
  }

  return { stats, issues }
}

export function RoomSection({
  id,
  title,
  color,
  entityIds,
  layout,
  onLayoutChange,
  dashboardConfig,
}: {
  id: string
  title: string
  color?: string
  entityIds: string[]
  layout?: CardLayout
  onLayoutChange: (layout: CardLayout) => void
  dashboardConfig: DashboardConfigApi
}) {
  const { t } = useTranslation()
  const summary = useSummary(entityIds)
  const { stats, issues } = useRoomStats(entityIds)
  const summaryStyle = dashboardConfig.getRoomSummaryStyle(id)

  return (
    <section className="mb-9">
      <div
        className="mb-3 flex flex-col items-center gap-2 border-b pb-3 text-center"
        style={{ borderColor: "var(--seam)" }}
      >
        <h2
          className="font-[family-name:var(--font-display)] text-xl font-medium transition-colors duration-300"
          style={{
            color: color ?? "var(--parchment)",
            textShadow: color ? `0 0 18px ${color}55` : undefined,
          }}
        >
          {title}
        </h2>
        {summaryStyle === "card" ? (
          <div className="w-full max-w-sm">
            <RoomSummaryCard stats={stats} issues={issues} />
          </div>
        ) : (
          summary && (
            <span className="font-[family-name:var(--font-mono)] text-xs whitespace-nowrap text-[var(--ash)]">
              {summary}
            </span>
          )
        )}
      </div>

      {entityIds.length > 0 ? (
        <CardGrid
          entityIds={entityIds}
          layout={layout}
          onLayoutChange={onLayoutChange}
          dashboardConfig={dashboardConfig}
        />
      ) : (
        <div
          className="rounded-2xl border border-dashed px-4 py-6 text-center text-sm"
          style={{ borderColor: "var(--seam)", color: "var(--ash-dim)" }}
        >
          {t("room.empty")}
        </div>
      )}
    </section>
  )
}
