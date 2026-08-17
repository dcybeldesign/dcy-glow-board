import { useEffect, useState } from "react"
import { useHomeAssistant } from "./useHomeAssistant"

export type HistoryPoint = { time: number; value: number }

export function useEntityHistory(entityId: string, hours = 24): HistoryPoint[] {
  const { restAuth } = useHomeAssistant()
  const [points, setPoints] = useState<HistoryPoint[]>([])

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
        const parsed = series
          .map((p) => ({
            time: new Date(p.last_changed).getTime(),
            value: parseFloat(p.state),
          }))
          .filter((p) => Number.isFinite(p.value))
        setPoints(parsed)
      })
      .catch(() => {
        // historique indisponible : le sparkline restera simplement vide
      })

    return () => controller.abort()
  }, [restAuth, entityId, hours])

  return points
}
