import type { Connection } from "home-assistant-js-websocket"

export type HAArea = {
  area_id: string
  name: string
  icon: string | null
}

export type HAEntityRegistryEntry = {
  entity_id: string
  area_id: string | null
  device_id: string | null
  hidden_by: string | null
  entity_category: string | null
}

export type HADeviceRegistryEntry = {
  id: string
  area_id: string | null
}

export function fetchAreas(conn: Connection): Promise<HAArea[]> {
  return conn.sendMessagePromise({ type: "config/area_registry/list" })
}

export function fetchEntityRegistry(
  conn: Connection,
): Promise<HAEntityRegistryEntry[]> {
  return conn.sendMessagePromise({ type: "config/entity_registry/list" })
}

export function fetchDeviceRegistry(
  conn: Connection,
): Promise<HADeviceRegistryEntry[]> {
  return conn.sendMessagePromise({ type: "config/device_registry/list" })
}
