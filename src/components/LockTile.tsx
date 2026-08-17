import { useRef, useState, type ReactElement, type PointerEvent as ReactPointerEvent } from "react"
import { useHomeAssistant } from "../hooks/useHomeAssistant"
import { useEntity } from "../hooks/useEntity"
import { useTranslation } from "../hooks/useTranslation"
import { LockClosedIcon, LockOpenIcon } from "../lib/deviceIcons"
import type { LockCardStyle } from "../hooks/useDashboardConfig"
import { GlowCard } from "./GlowCard"

const THUMB = 38
const TRACK_PAD = 3
const UNLOCK_THRESHOLD = 0.85

function SlideToUnlockCard({
  displayName,
  isLocked,
  isBusy,
  onUnlock,
  onLock,
}: {
  displayName: string
  isLocked: boolean
  isBusy: boolean
  onUnlock: () => void
  onLock: () => void
}) {
  const { t } = useTranslation()
  const trackRef = useRef<HTMLDivElement>(null)
  const [dragLeft, setDragLeft] = useState<number | null>(null)

  function startDrag(e: ReactPointerEvent) {
    if (!isLocked || isBusy) return
    const track = trackRef.current
    if (!track) return
    const maxLeft = track.clientWidth - THUMB - TRACK_PAD * 2
    const startX = e.clientX

    function move(ev: PointerEvent) {
      const left = Math.max(TRACK_PAD, Math.min(TRACK_PAD + maxLeft, TRACK_PAD + (ev.clientX - startX)))
      setDragLeft(left)
    }
    function up(ev: PointerEvent) {
      const left = Math.max(TRACK_PAD, Math.min(TRACK_PAD + maxLeft, TRACK_PAD + (ev.clientX - startX)))
      if (left >= TRACK_PAD + maxLeft * UNLOCK_THRESHOLD) onUnlock()
      setDragLeft(null)
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
  }

  const color = isLocked ? "var(--moss)" : "var(--coral)"

  return (
    <GlowCard active={!isLocked} color="var(--coral)" intensity={0.28}>
      <div className="flex items-center gap-3">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-500"
          style={{ background: "var(--ink)", color }}
        >
          <div className="h-4 w-4">{isLocked ? <LockClosedIcon /> : <LockOpenIcon />}</div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-[var(--parchment)]">{displayName}</div>
          <div className="mt-0.5 text-xs text-[var(--ash)]">
            {isBusy ? "…" : isLocked ? t("lock.locked") : t("lock.unlocked")}
          </div>
        </div>
      </div>

      <div
        ref={trackRef}
        onClick={() => !isLocked && !isBusy && onLock()}
        className="relative mt-3 h-11 touch-none overflow-hidden rounded-full border select-none"
        style={{
          borderColor: "var(--seam)",
          background: "var(--ink)",
          cursor: isLocked ? "grab" : "pointer",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-[1]"
          style={{
            width: dragLeft !== null ? dragLeft + THUMB / 2 : TRACK_PAD,
            background: "color-mix(in srgb, var(--moss) 30%, transparent)",
            transition: dragLeft !== null ? "none" : "width 0.2s ease",
          }}
        />
        <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center text-xs text-[var(--ash-dim)]">
          {isLocked ? t("lock.slideToUnlock") : t("lock.tapToLock")}
        </div>
        <div
          onPointerDown={startDrag}
          className="absolute top-[3px] z-[2] flex items-center justify-center rounded-full"
          style={{
            left: dragLeft ?? TRACK_PAD,
            width: THUMB,
            height: THUMB,
            background: "var(--parchment)",
            color: "var(--ink)",
            cursor: isLocked ? "grab" : "default",
            transition: dragLeft !== null ? "none" : "left 0.2s ease",
          }}
        >
          <div className="h-4 w-4">{isLocked ? <LockClosedIcon /> : <LockOpenIcon />}</div>
        </div>
      </div>
    </GlowCard>
  )
}

export function LockTile({
  entityId,
  displayName,
  icon,
  style = "default",
}: {
  entityId: string
  displayName?: string
  icon?: ReactElement
  style?: LockCardStyle
}) {
  const entity = useEntity(entityId)
  const { callService } = useHomeAssistant()
  const { t } = useTranslation()

  if (!entity) return null

  const isLocked = entity.state === "locked"
  const isBusy = entity.state === "locking" || entity.state === "unlocking"
  const resolvedName = displayName ?? (entity.attributes.friendly_name as string | undefined) ?? entityId

  function toggle() {
    callService("lock", isLocked ? "unlock" : "lock", { entity_id: entityId })
  }

  if (style === "slide") {
    return (
      <SlideToUnlockCard
        displayName={resolvedName}
        isLocked={isLocked}
        isBusy={isBusy}
        onUnlock={() => callService("lock", "unlock", { entity_id: entityId })}
        onLock={() => callService("lock", "lock", { entity_id: entityId })}
      />
    )
  }

  return (
    <GlowCard active={!isLocked} color="var(--coral)" intensity={0.28}>
      <div className="flex items-center gap-3">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-500"
          style={{ background: "var(--ink)", color: isLocked ? "var(--moss)" : "var(--coral)" }}
        >
          <div className="h-4 w-4">{icon ?? (isLocked ? <LockClosedIcon /> : <LockOpenIcon />)}</div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-[var(--parchment)]">{resolvedName}</div>
          <div className="mt-0.5 text-xs text-[var(--ash)]">
            {isBusy ? "…" : isLocked ? t("lock.locked") : t("lock.unlocked")}
          </div>
        </div>

        <button
          type="button"
          onClick={toggle}
          disabled={isBusy}
          className="rounded-full px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40"
          style={{
            background: isLocked ? "var(--seam)" : "var(--moss)",
            color: isLocked ? "var(--parchment)" : "var(--ink)",
          }}
        >
          {isLocked ? t("lock.unlockButton") : t("lock.lockButton")}
        </button>
      </div>
    </GlowCard>
  )
}
