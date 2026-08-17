import { useState } from "react"
import { useHomeAssistant } from "../hooks/useHomeAssistant"
import { useEntity } from "../hooks/useEntity"
import { useTranslation } from "../hooks/useTranslation"
import { BackspaceIcon, CheckIcon, ShieldIcon } from "../lib/deviceIcons"
import type { AlarmCardStyle } from "../hooks/useDashboardConfig"
import type { TranslationKey } from "../lib/i18n"
import { GlowCard } from "./GlowCard"

const STATE_LABEL_KEYS: Record<string, TranslationKey> = {
  disarmed: "alarm.state.disarmed",
  armed_home: "alarm.state.armed_home",
  armed_away: "alarm.state.armed_away",
  armed_night: "alarm.state.armed_night",
  armed_vacation: "alarm.state.armed_vacation",
  armed_custom_bypass: "alarm.state.armed_custom_bypass",
  pending: "alarm.state.pending",
  arming: "alarm.state.arming",
  disarming: "alarm.state.disarming",
  triggered: "alarm.state.triggered",
}

const MODES: { key: string; action: string; feature: number; label: TranslationKey }[] = [
  { key: "armed_home", action: "alarm_arm_home", feature: 1, label: "alarm.mode.home" },
  { key: "armed_away", action: "alarm_arm_away", feature: 2, label: "alarm.mode.away" },
  { key: "armed_night", action: "alarm_arm_night", feature: 4, label: "alarm.mode.night" },
]

function stateColor(state: string): string {
  if (state === "triggered") return "var(--danger)"
  if (state === "disarmed") return "var(--moss)"
  if (state === "pending" || state === "arming" || state === "disarming") return "var(--flame)"
  return "var(--coral)"
}

function AlarmCardBody({
  entityId,
  displayName,
  alwaysShowPad,
}: {
  entityId: string
  displayName: string
  alwaysShowPad: boolean
}) {
  const entity = useEntity(entityId)
  const { callService } = useHomeAssistant()
  const { t } = useTranslation()
  const [pendingAction, setPendingAction] = useState<string | null>(alwaysShowPad ? "alarm_disarm" : null)
  const [code, setCode] = useState("")

  if (!entity) return null

  const state = entity.state
  const attrs = entity.attributes as Record<string, unknown>
  const supported = (attrs.supported_features as number | undefined) ?? 0
  const needsCode = Boolean(attrs.code_format)
  const color = stateColor(state)
  const label = STATE_LABEL_KEYS[state] ? t(STATE_LABEL_KEYS[state]) : state

  const availableModes = MODES.filter((m) => (supported & m.feature) !== 0)

  function requestAction(action: string) {
    if (needsCode) {
      setPendingAction(action)
      setCode("")
      return
    }
    callService("alarm_control_panel", action, { entity_id: entityId })
  }

  function confirmCode() {
    if (!pendingAction) return
    callService("alarm_control_panel", pendingAction, { entity_id: entityId, code })
    setCode("")
    if (!alwaysShowPad) setPendingAction(null)
  }

  const showPad = alwaysShowPad || pendingAction !== null

  return (
    <GlowCard active={state !== "disarmed"} color={color} intensity={state === "triggered" ? 0.4 : 0.22}>
      <div className="flex items-center gap-3">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={{ background: "var(--ink)", color }}
        >
          <div className="h-4 w-4">
            <ShieldIcon />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-[var(--parchment)]">{displayName}</div>
          <div className="mt-0.5 text-xs" style={{ color }}>
            {label}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => requestAction("alarm_disarm")}
          className="rounded-full border px-3 py-1 text-xs transition-colors"
          style={
            state === "disarmed"
              ? { borderColor: "var(--moss)", color: "var(--ink)", background: "var(--moss)" }
              : { borderColor: "var(--seam)", color: "var(--ash)" }
          }
        >
          {t("alarm.disarm")}
        </button>
        {availableModes.map((mode) => (
          <button
            key={mode.key}
            type="button"
            onClick={() => requestAction(mode.action)}
            className="rounded-full border px-3 py-1 text-xs transition-colors"
            style={
              state === mode.key
                ? { borderColor: "var(--coral)", color: "var(--ink)", background: "var(--coral)" }
                : { borderColor: "var(--seam)", color: "var(--ash)" }
            }
          >
            {t(mode.label)}
          </button>
        ))}
      </div>

      {showPad && (
        <div className="mt-3">
          <div className="mb-2 flex justify-center gap-2">
            {Array.from({ length: Math.max(code.length, 4) }, (_, i) => (
              <div
                key={i}
                className="h-2.5 w-2.5 rounded-full border"
                style={{
                  borderColor: i < code.length ? "var(--flame)" : "var(--ash-dim)",
                  background: i < code.length ? "var(--flame)" : "transparent",
                }}
              />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => setCode((c) => c + digit)}
                className="flex items-center justify-center rounded-xl border font-[family-name:var(--font-mono)] text-base text-[var(--parchment)]"
                style={{ borderColor: "var(--seam)", aspectRatio: "1", background: "transparent" }}
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCode((c) => c.slice(0, -1))}
              className="flex items-center justify-center rounded-xl border text-[var(--ash-dim)]"
              style={{ borderColor: "var(--seam)", aspectRatio: "1" }}
              aria-label={t("alarm.keypadClear")}
            >
              <div className="h-4 w-4">
                <BackspaceIcon />
              </div>
            </button>
            <button
              type="button"
              onClick={() => setCode((c) => c + "0")}
              className="flex items-center justify-center rounded-xl border font-[family-name:var(--font-mono)] text-base text-[var(--parchment)]"
              style={{ borderColor: "var(--seam)", aspectRatio: "1" }}
            >
              0
            </button>
            <button
              type="button"
              onClick={confirmCode}
              disabled={code.length === 0}
              className="flex items-center justify-center rounded-xl border disabled:opacity-40"
              style={{ borderColor: "var(--moss)", color: "var(--moss)", aspectRatio: "1" }}
              aria-label={t("alarm.keypadConfirm")}
            >
              <div className="h-4 w-4">
                <CheckIcon />
              </div>
            </button>
          </div>
        </div>
      )}
    </GlowCard>
  )
}

export function AlarmTile({
  entityId,
  displayName,
  style = "default",
}: {
  entityId: string
  displayName?: string
  style?: AlarmCardStyle
}) {
  const entity = useEntity(entityId)
  if (!entity) return null

  const resolvedName = displayName ?? (entity.attributes.friendly_name as string | undefined) ?? entityId
  const needsCode = Boolean(entity.attributes.code_format)

  return (
    <AlarmCardBody
      entityId={entityId}
      displayName={resolvedName}
      alwaysShowPad={style === "keypad" && needsCode}
    />
  )
}
