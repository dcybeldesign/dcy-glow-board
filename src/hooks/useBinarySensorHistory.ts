import { useEffect, useState } from "react"
import { useHomeAssistant } from "./useHomeAssistant"

export type BinaryHistoryPoint = { time: number; isOn: boolean }

// Same REST endpoint as useEntityHistory, but keeps the raw on/off state
// instead of parsing it as a number — on/off states aren't numeric.
export function useBinarySensorHistory(entityId: string, hours = 12): BinaryHistoryPoint[] {
  const { restAuth } = useHomeAssistant()
  const [points, setPoints] = useState<BinaryHistoryPoint[]>([])

  useEffect(() => {
    if (!restAuth) return
    const controller = new AbortController()
    const start = new Date(Date.now() - hours * 3600_000).toISOString()
    const url = `${restAuth.url}/api/history/period/${start}?filter_entity_id=${encodeURIComponent(
      entityId,
    )}&minimal_response`

    fetch(url, {
      headers: { Authorization: `Bearer ${restAuth.token}` },
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data: Array<Array<{ state: string; last_changed: string }>>) => {
        const series = data[0] ?? []
        setPoints(
          series.map((p) => ({
            time: new Date(p.last_changed).getTime(),
            isOn: p.state === "on",
          })),
        )
      })
      .catch(() => {
        // historique indisponible : la frise restera simplement plate
      })

    return () => controller.abort()
  }, [restAuth, entityId, hours])

  return points
}
