import { useState } from "react"
import { useEntity } from "../hooks/useEntity"
import { useCameraSnapshot } from "../hooks/useCameraSnapshot"
import { useTranslation } from "../hooks/useTranslation"
import { CameraIcon } from "../lib/deviceIcons"
import type { CameraCardStyle } from "../hooks/useDashboardConfig"
import { GlowCard } from "./GlowCard"

function PreviewCameraCard({ entityId, displayName }: { entityId: string; displayName: string }) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  const snapshotUrl = useCameraSnapshot(entityId, true)

  return (
    <>
      <div
        className="overflow-hidden rounded-2xl border"
        style={{ borderColor: "rgba(255,255,255,0.09)", background: "#000" }}
      >
        <button
          type="button"
          onClick={() => snapshotUrl && setExpanded(true)}
          className="relative flex h-[168px] w-full items-center justify-center"
          style={{
            backgroundImage: snapshotUrl ? `url(${snapshotUrl})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            background: snapshotUrl ? undefined : "linear-gradient(160deg,#2b2620,#171310)",
            cursor: snapshotUrl ? "zoom-in" : "default",
          }}
          aria-label={t("camera.expandAria", { name: displayName })}
        >
          {!snapshotUrl && (
            <div className="h-9 w-9" style={{ color: "var(--ash-dim)" }}>
              <CameraIcon />
            </div>
          )}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 px-3 py-2.5"
            style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.75) 100%)" }}
          >
            <div className="truncate text-left font-medium text-[var(--parchment)]" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}>
              {displayName}
            </div>
          </div>
        </button>
      </div>

      {expanded && snapshotUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={() => setExpanded(false)}
        >
          <img
            src={snapshotUrl}
            alt={displayName}
            className="max-h-full max-w-full rounded-lg"
            style={{ boxShadow: "0 20px 60px -10px rgba(0,0,0,0.8)" }}
          />
        </div>
      )}
    </>
  )
}

export function CameraTile({
  entityId,
  displayName,
  style = "default",
}: {
  entityId: string
  displayName?: string
  style?: CameraCardStyle
}) {
  const entity = useEntity(entityId)
  const { t } = useTranslation()
  if (!entity) return null

  const resolvedName = displayName ?? (entity.attributes.friendly_name as string | undefined) ?? entityId

  if (style === "preview") {
    return <PreviewCameraCard entityId={entityId} displayName={resolvedName} />
  }

  const isRecording = entity.state === "recording"

  return (
    <GlowCard active={isRecording} color="var(--frost)" intensity={0.28}>
      <div className="flex items-center gap-3">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
          style={{ background: "var(--ink)", color: isRecording ? "var(--frost)" : "var(--ash-dim)" }}
        >
          <div className="h-4 w-4">
            <CameraIcon />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-[var(--parchment)]">{resolvedName}</div>
          <div className="mt-0.5 font-[family-name:var(--font-mono)] text-xs text-[var(--ash)]">
            {isRecording ? t("camera.recording") : entity.state}
          </div>
        </div>
      </div>
    </GlowCard>
  )
}
