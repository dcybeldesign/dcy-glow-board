import { useRef, type ReactElement, type PointerEvent as ReactPointerEvent } from "react"
import { useHomeAssistant } from "../hooks/useHomeAssistant"
import { useEntity } from "../hooks/useEntity"
import { useLiveSlider } from "../hooks/useLiveSlider"
import { useTranslation } from "../hooks/useTranslation"
import { getCoverIcon, ChevronUpIcon, ChevronDownIcon, StopSquareIcon } from "../lib/deviceIcons"
import type { CoverCardStyle } from "../hooks/useDashboardConfig"
import { GlowCard } from "./GlowCard"

function CoverButtons({ onOpen, onStop, onClose }: { onOpen: () => void; onStop: () => void; onClose: () => void }) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onOpen}
        className="flex h-8 flex-1 items-center justify-center rounded-lg border text-[var(--parchment)] transition-colors hover:bg-[var(--ember-hover)]"
        style={{ borderColor: "var(--seam)" }}
        aria-label={t("cover.openAria")}
      >
        <div className="h-4 w-4">
          <ChevronUpIcon />
        </div>
      </button>
      <button
        type="button"
        onClick={onStop}
        className="flex h-8 flex-1 items-center justify-center rounded-lg border text-[var(--parchment)] transition-colors hover:bg-[var(--ember-hover)]"
        style={{ borderColor: "var(--seam)" }}
        aria-label={t("cover.stopAria")}
      >
        <div className="h-4 w-4">
          <StopSquareIcon />
        </div>
      </button>
      <button
        type="button"
        onClick={onClose}
        className="flex h-8 flex-1 items-center justify-center rounded-lg border text-[var(--parchment)] transition-colors hover:bg-[var(--ember-hover)]"
        style={{ borderColor: "var(--seam)" }}
        aria-label={t("cover.closeAria")}
      >
        <div className="h-4 w-4">
          <ChevronDownIcon />
        </div>
      </button>
    </div>
  )
}

function TileCoverCard({
  displayName,
  position,
  isMoving,
  onPositionChange,
  onOpen,
  onStop,
  onClose,
}: {
  displayName: string
  position: number
  isMoving: boolean
  onPositionChange: (pct: number) => void
  onOpen: () => void
  onStop: () => void
  onClose: () => void
}) {
  const windowRef = useRef<HTMLDivElement>(null)

  function startDrag(e: ReactPointerEvent) {
    const el = windowRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    function update(clientY: number) {
      const frac = 1 - (clientY - rect.top) / rect.height
      onPositionChange(Math.round(Math.max(0, Math.min(1, frac)) * 100))
    }
    update(e.clientY)
    function move(ev: PointerEvent) {
      update(ev.clientY)
    }
    function up() {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
  }

  return (
    <GlowCard active={position > 0} color="var(--frost)" intensity={0.15 + (position / 100) * 0.35}>
      <div className="flex gap-3.5">
        <div
          ref={windowRef}
          onPointerDown={startDrag}
          className="relative h-28 w-14 shrink-0 touch-none overflow-hidden rounded-lg border select-none"
          style={{
            borderColor: "var(--seam)",
            background: "linear-gradient(180deg, #2a3a44, #1a2228)",
            cursor: "pointer",
          }}
        >
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 transition-[height] duration-200"
            style={{ height: `${100 - position}%`, background: "var(--seam)" }}
          >
            <div className="absolute inset-x-0 bottom-0 h-[3px]" style={{ background: "var(--ash-dim)" }} />
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
          <div>
            <div className="truncate font-medium text-[var(--parchment)]">{displayName}</div>
            <div className="font-[family-name:var(--font-mono)] text-xl" style={{ color: "var(--frost)" }}>
              {isMoving ? "…" : `${position}%`}
            </div>
          </div>
          <CoverButtons onOpen={onOpen} onStop={onStop} onClose={onClose} />
        </div>
      </div>
    </GlowCard>
  )
}

export function CoverTile({
  entityId,
  displayName,
  icon,
  style = "default",
}: {
  entityId: string
  displayName?: string
  icon?: ReactElement
  style?: CoverCardStyle
}) {
  const entity = useEntity(entityId)
  const { callService } = useHomeAssistant()
  const { t } = useTranslation()

  const domain = entityId.split(".")[0]
  const state = entity?.state
  const position = entity?.attributes.current_position as number | undefined
  const isMoving = state === "opening" || state === "closing"

  function setPosition(pct: number) {
    callService(domain, "set_cover_position", { entity_id: entityId, position: pct })
  }

  const positionSlider = useLiveSlider(position ?? 0, setPosition)

  if (!entity) return null

  function open() {
    callService(domain, "open_cover", { entity_id: entityId })
  }
  function close() {
    callService(domain, "close_cover", { entity_id: entityId })
  }
  function stop() {
    callService(domain, "stop_cover", { entity_id: entityId })
  }

  const isOpenish = state !== "closed"
  const glowIntensity = position !== undefined ? 0.15 + (position / 100) * 0.35 : 0.3
  const resolvedIcon = icon ?? getCoverIcon(entity.attributes.device_class as string | undefined)
  const resolvedName = displayName ?? (entity.attributes.friendly_name as string | undefined) ?? entityId

  if (style === "tile" && position !== undefined) {
    return (
      <TileCoverCard
        displayName={resolvedName}
        position={positionSlider.value}
        isMoving={isMoving}
        onPositionChange={positionSlider.onChange}
        onOpen={open}
        onStop={stop}
        onClose={close}
      />
    )
  }

  return (
    <GlowCard active={isOpenish} color="var(--frost)" intensity={glowIntensity}>
      <div className="mb-3 flex items-center gap-3">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={{
            background: "var(--ink)",
            color: state === "closed" ? "var(--ash-dim)" : "var(--frost)",
          }}
        >
          <div className="h-4 w-4">{resolvedIcon}</div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-[var(--parchment)]">{resolvedName}</div>
          <div className="mt-0.5 font-[family-name:var(--font-mono)] text-xs text-[var(--ash)]">
            {isMoving
              ? state === "opening"
                ? t("cover.opening")
                : t("cover.closing")
              : state === "closed"
                ? t("cover.closedState")
                : t("cover.openState")}
            {position !== undefined ? ` · ${positionSlider.value}%` : ""}
          </div>
        </div>
      </div>

      <CoverButtons onOpen={open} onStop={stop} onClose={close} />

      {position !== undefined && (
        <input
          type="range"
          min={0}
          max={100}
          value={positionSlider.value}
          onChange={(e) => positionSlider.onChange(Number(e.target.value))}
          className="mt-3 w-full accent-[var(--frost)]"
        />
      )}
    </GlowCard>
  )
}
