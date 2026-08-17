import { useContext } from "react"
import { HomeAssistantContext } from "../context/homeAssistantContext"

export function useHomeAssistant() {
  const ctx = useContext(HomeAssistantContext)
  if (!ctx) {
    throw new Error("useHomeAssistant must be used within <HomeAssistantProvider>")
  }
  return ctx
}
