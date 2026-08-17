import { useMemo } from "react"
import type { HassEntity } from "home-assistant-js-websocket"
import { useHomeAssistant } from "./useHomeAssistant"

export function useEntity(entityId: string): HassEntity | undefined {
  const { entities } = useHomeAssistant()
  return entities[entityId]
}

export function useEntitiesByDomain(domain: string): HassEntity[] {
  const { entities } = useHomeAssistant()
  return useMemo(
    () =>
      Object.values(entities).filter((e) =>
        e.entity_id.startsWith(`${domain}.`),
      ),
    [entities, domain],
  )
}

export function useEntitiesByIds(entityIds: string[]): HassEntity[] {
  const { entities } = useHomeAssistant()
  return useMemo(
    () => entityIds.map((id) => entities[id]).filter((e): e is HassEntity => !!e),
    [entities, entityIds],
  )
}
