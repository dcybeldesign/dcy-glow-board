import { useEffect, useRef, useState } from "react"
import { useHomeAssistant } from "./useHomeAssistant"

// Camera images come from HA's authenticated REST proxy, not the WebSocket
// API — a plain <img src> can't attach the bearer token, so this fetches the
// JPEG manually and hands the component an object URL to render instead.
export function useCameraSnapshot(entityId: string, enabled: boolean, intervalMs = 8000): string | undefined {
  const { restAuth } = useHomeAssistant()
  const [url, setUrl] = useState<string | undefined>(undefined)
  const urlRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (!enabled || !restAuth) return

    let cancelled = false

    function revokeCurrent() {
      if (urlRef.current) {
        URL.revokeObjectURL(urlRef.current)
        urlRef.current = undefined
      }
    }

    async function fetchSnapshot() {
      if (!restAuth) return
      try {
        const res = await fetch(`${restAuth.url}/api/camera_proxy/${entityId}`, {
          headers: { Authorization: `Bearer ${restAuth.token}` },
        })
        if (!res.ok || cancelled) return
        const blob = await res.blob()
        if (cancelled) return
        const next = URL.createObjectURL(blob)
        revokeCurrent()
        urlRef.current = next
        setUrl(next)
      } catch {
        // caméra injoignable : la vignette précédente reste affichée telle quelle
      }
    }

    fetchSnapshot()
    const interval = window.setInterval(fetchSnapshot, intervalMs)

    return () => {
      cancelled = true
      window.clearInterval(interval)
      revokeCurrent()
      setUrl(undefined)
    }
  }, [enabled, restAuth, entityId, intervalMs])

  return url
}
