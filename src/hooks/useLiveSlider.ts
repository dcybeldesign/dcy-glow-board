import { useEffect, useRef, useState } from "react"

/**
 * A slider's `value` must never wait on a network round-trip to move — otherwise
 * every drag tick stutters as React snaps the input back to the stale entity
 * state between HA websocket pushes. This keeps the displayed value in local
 * state (always instant) and debounces the actual service call until the user
 * pauses, instead of firing one per pixel of drag.
 */
export function useLiveSlider(
  externalValue: number,
  onCommit: (value: number) => void,
  debounceMs = 150,
) {
  const [value, setValue] = useState(externalValue)
  const isDraggingRef = useRef(false)
  const timeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!isDraggingRef.current) setValue(externalValue)
  }, [externalValue])

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== undefined) window.clearTimeout(timeoutRef.current)
    }
  }, [])

  function onChange(next: number) {
    setValue(next)
    isDraggingRef.current = true
    if (timeoutRef.current !== undefined) window.clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(() => {
      isDraggingRef.current = false
      onCommit(next)
    }, debounceMs)
  }

  return { value, onChange }
}
