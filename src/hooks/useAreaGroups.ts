import { useMemo } from "react"
import { useHomeAssistant } from "./useHomeAssistant"
import { useTranslation } from "./useTranslation"

const TRACKED_DOMAINS = new Set([
  "light",
  "switch",
  "climate",
  "sensor",
  "cover",
  "fan",
  "lock",
  "binary_sensor",
  "button",
  "scene",
  "script",
  "weather",
  "media_player",
  "camera",
  "alarm_control_panel",
  "vacuum",
])

export type AreaGroup = {
  areaId: string | null
  name: string
  lightIds: string[]
  climateIds: string[]
  sensorIds: string[]
  otherIds: string[]
}

function emptyGroup(areaId: string | null, name: string): AreaGroup {
  return { areaId, name, lightIds: [], climateIds: [], sensorIds: [], otherIds: [] }
}

export function useAreaGroups(): AreaGroup[] {
  const { entities, areas, entityRegistry, deviceRegistry } = useHomeAssistant()
  const { t, language } = useTranslation()

  return useMemo(() => {
    const deviceAreaById = new Map(deviceRegistry.map((d) => [d.id, d.area_id]))
    const registryByEntityId = new Map(entityRegistry.map((e) => [e.entity_id, e]))

    const groups = new Map<string | null, AreaGroup>()
    for (const area of areas) {
      groups.set(area.area_id, emptyGroup(area.area_id, area.name))
    }
    const unassigned = emptyGroup(null, t("area.unassigned"))
    groups.set(null, unassigned)

    for (const entityId of Object.keys(entities)) {
      const domain = entityId.split(".")[0]
      if (!TRACKED_DOMAINS.has(domain)) continue

      const reg = registryByEntityId.get(entityId)
      if (reg?.hidden_by) continue
      if (reg?.entity_category) continue

      const areaId =
        reg?.area_id ??
        (reg?.device_id ? (deviceAreaById.get(reg.device_id) ?? null) : null)
      const group = groups.get(areaId) ?? unassigned

      if (domain === "light" || domain === "switch") group.lightIds.push(entityId)
      else if (domain === "climate") group.climateIds.push(entityId)
      else if (domain === "sensor") group.sensorIds.push(entityId)
      else group.otherIds.push(entityId)
    }

    const ordered = areas.map((area) => groups.get(area.area_id)!)
    if (
      unassigned.lightIds.length ||
      unassigned.climateIds.length ||
      unassigned.sensorIds.length ||
      unassigned.otherIds.length
    ) {
      ordered.push(unassigned)
    }
    return ordered
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entities, areas, entityRegistry, deviceRegistry, language])
}
