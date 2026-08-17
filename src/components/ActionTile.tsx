import { useEffect, useRef, useState, type ReactElement } from "react"
import { useHomeAssistant } from "../hooks/useHomeAssistant"
import { useEntity } from "../hooks/useEntity"
import { useTranslation } from "../hooks/useTranslation"
import { getActionIcon } from "../lib/deviceIcons"
import type { TranslationKey } from "../lib/i18n"
import { GlowCard } from "./GlowCard"

const ACTION_LABEL_KEYS: Record<string, TranslationKey> = {
  button: "action.button",
  scene: "action.scene",
  script: "action.script",
}

const ACTION_SERVICES: Record<string, string> = {
  button: "press",
  scene: "turn_on",
  script: "turn_on",
}

const ACTION_COLORS: Record<string, string> = {
  button: "var(--flame)",
  scene: "var(--frost)",
  script: "var(--moss)",
}

export function ActionTile({
  entityId,
  displayName,
  icon,
}: {
  entityId: string
  displayName?: string
  icon?: ReactElement
}) {
  const entity = useEntity(entityId)
  const { callService } = useHomeAssistant()
  const { t } = useTranslation()
  const iconRef = useRef<HTMLDivElement>(null)
  const firstRender = useRef(true)
  const feedbackTimeoutRef = useRef<number | undefined>(undefined)
  const [triggerCount, setTriggerCount] = useState(0)
  const [justTriggered, setJustTriggered] = useState(false)

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    const el = iconRef.current
    if (!el) return
    el.classList.remove("icon-pulse")
    void el.offsetWidth
    el.classList.add("icon-pulse")
  }, [triggerCount])

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current !== undefined) window.clearTimeout(feedbackTimeoutRef.current)
    }
  }, [])

  if (!entity) return null

  const domain = entityId.split(".")[0]
  const isRunning = domain === "script" && entity.state === "on"
  const accentColor = ACTION_COLORS[domain] ?? "var(--flame)"

  function trigger() {
    callService(domain, ACTION_SERVICES[domain] ?? "turn_on", { entity_id: entityId })
    setTriggerCount((c) => c + 1)
    setJustTriggered(true)
    if (feedbackTimeoutRef.current !== undefined) window.clearTimeout(feedbackTimeoutRef.current)
    feedbackTimeoutRef.current = window.setTimeout(() => setJustTriggered(false), 1200)
  }

  return (
    <GlowCard active={isRunning} color="var(--flame)" intensity={0.35}>
      <div className="flex items-center gap-3">
        <div
          ref={iconRef}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-500"
          style={{ background: "var(--ink)", color: isRunning ? "var(--flame)" : accentColor }}
        >
          <div className="h-4 w-4">{icon ?? getActionIcon(domain)}</div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-[var(--parchment)]">
            {displayName ?? entity.attributes.friendly_name ?? entityId}
          </div>
          {isRunning && <div className="mt-0.5 text-xs text-[var(--flame)]">{t("action.running")}</div>}
        </div>

        <button
          type="button"
          onClick={trigger}
          className="rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 active:scale-90"
          style={{ background: justTriggered ? "var(--moss)" : accentColor, color: "var(--ink)" }}
        >
          {justTriggered ? "✓" : t(ACTION_LABEL_KEYS[domain] ?? "action.scene")}
        </button>
      </div>
    </GlowCard>
  )
}
