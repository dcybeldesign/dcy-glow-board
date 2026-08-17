import type { ReactElement } from "react"
import { useHomeAssistant } from "../hooks/useHomeAssistant"
import { useEntity } from "../hooks/useEntity"
import { useLiveSlider } from "../hooks/useLiveSlider"
import { useTranslation } from "../hooks/useTranslation"
import type { TranslationKey } from "../lib/i18n"
import {
  MediaNextIcon,
  MediaPauseIcon,
  MediaPlayIcon,
  MediaPreviousIcon,
  getMediaPlayerIcon,
} from "../lib/deviceIcons"
import type { MediaPlayerCardStyle } from "../hooks/useDashboardConfig"
import { GlowCard } from "./GlowCard"

function resolvePictureUrl(baseUrl: string | undefined, picture: string | undefined): string | undefined {
  if (!picture) return undefined
  if (picture.startsWith("http://") || picture.startsWith("https://")) return picture
  return baseUrl ? `${baseUrl}${picture}` : undefined
}

function formatTime(seconds: number | undefined): string {
  if (seconds === undefined || !Number.isFinite(seconds)) return "0:00"
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

function VolumeRow({ value, onChange, color }: { value: number; onChange: (v: number) => void; color: string }) {
  return (
    <input
      type="range"
      min={0}
      max={100}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full"
      style={{ accentColor: color }}
    />
  )
}

function TransportRow({
  isPlaying,
  onPrevious,
  onPlayPause,
  onNext,
  color,
  size = "default",
}: {
  isPlaying: boolean
  onPrevious?: () => void
  onPlayPause: () => void
  onNext?: () => void
  color: string
  size?: "default" | "large"
}) {
  const { t } = useTranslation()
  const btnSize = size === "large" ? "h-9 w-9" : "h-[30px] w-[30px]"
  const playBtnSize = size === "large" ? "h-11 w-11" : "h-[38px] w-[38px]"
  const iconSize = size === "large" ? "h-4 w-4" : "h-3.5 w-3.5"
  const playIconSize = size === "large" ? "h-5 w-5" : "h-4 w-4"

  return (
    <div className="flex items-center gap-2">
      {onPrevious && (
        <button
          type="button"
          onClick={onPrevious}
          aria-label={t("media.previous")}
          className={`flex ${btnSize} shrink-0 items-center justify-center rounded-full border text-[var(--parchment)] transition-colors hover:bg-[var(--ember-hover)]`}
          style={{ borderColor: "var(--seam)" }}
        >
          <div className={iconSize}>
            <MediaPreviousIcon />
          </div>
        </button>
      )}
      <button
        type="button"
        onClick={onPlayPause}
        aria-label={isPlaying ? t("media.pause") : t("media.play")}
        className={`flex ${playBtnSize} shrink-0 items-center justify-center rounded-full border transition-colors`}
        style={{ borderColor: color, color }}
      >
        <div className={playIconSize}>{isPlaying ? <MediaPauseIcon /> : <MediaPlayIcon />}</div>
      </button>
      {onNext && (
        <button
          type="button"
          onClick={onNext}
          aria-label={t("media.next")}
          className={`flex ${btnSize} shrink-0 items-center justify-center rounded-full border text-[var(--parchment)] transition-colors hover:bg-[var(--ember-hover)]`}
          style={{ borderColor: "var(--seam)" }}
        >
          <div className={iconSize}>
            <MediaNextIcon />
          </div>
        </button>
      )}
    </div>
  )
}

type MediaState = {
  entityId: string
  domain: string
  resolvedName: string
  resolvedIcon: ReactElement
  isPlaying: boolean
  isOn: boolean
  subtitle: string
  volumePct: number | undefined
  mediaTitle: string | undefined
  mediaArtist: string | undefined
  pictureUrl: string | undefined
  duration: number | undefined
  position: number | undefined
  play: () => void
  pause: () => void
  next: () => void
  previous: () => void
  setVolume: (pct: number) => void
}

function useMediaPlayerState(
  entityId: string,
  displayName: string | undefined,
  icon: ReactElement | undefined,
): MediaState | null {
  const entity = useEntity(entityId)
  const { callService, restAuth } = useHomeAssistant()
  const { t } = useTranslation()

  if (!entity) return null

  const domain = entityId.split(".")[0]
  const state = entity.state
  const isOn = state !== "off" && state !== "unavailable" && state !== "unknown"
  const isPlaying = state === "playing"
  const attrs = entity.attributes as Record<string, unknown>
  const volumeLevel = attrs.volume_level as number | undefined
  const appName = attrs.app_name as string | undefined
  const source = attrs.source as string | undefined
  const mediaTitle = attrs.media_title as string | undefined
  const mediaArtist = attrs.media_artist as string | undefined
  const pictureUrl = resolvePictureUrl(restAuth?.url, attrs.entity_picture as string | undefined)

  const stateLabelKeys: Record<string, TranslationKey> = {
    playing: "media.state.playing",
    paused: "media.state.paused",
    idle: "media.state.idle",
    off: "media.state.off",
    on: "media.state.on",
    unavailable: "media.state.unavailable",
  }
  const subtitle = [appName ?? source, stateLabelKeys[state] ? t(stateLabelKeys[state]) : state]
    .filter(Boolean)
    .join(" · ")

  function play() {
    callService("media_player", "media_play", { entity_id: entityId })
  }
  function pause() {
    callService("media_player", "media_pause", { entity_id: entityId })
  }
  function next() {
    callService("media_player", "media_next_track", { entity_id: entityId })
  }
  function previous() {
    callService("media_player", "media_previous_track", { entity_id: entityId })
  }
  function setVolume(pct: number) {
    callService("media_player", "volume_set", { entity_id: entityId, volume_level: pct / 100 })
  }

  return {
    entityId,
    domain,
    resolvedName: displayName ?? (attrs.friendly_name as string | undefined) ?? entityId,
    resolvedIcon: icon ?? getMediaPlayerIcon(attrs.device_class as string | undefined),
    isPlaying,
    isOn,
    subtitle,
    volumePct: volumeLevel !== undefined ? Math.round(volumeLevel * 100) : undefined,
    mediaTitle,
    mediaArtist,
    pictureUrl,
    duration: attrs.media_duration as number | undefined,
    position: attrs.media_position as number | undefined,
    play,
    pause,
    next,
    previous,
    setVolume,
  }
}

function DefaultMediaPlayerCard({ media }: { media: MediaState }) {
  const volumeSlider = useLiveSlider(media.volumePct ?? 0, media.setVolume)

  return (
    <GlowCard active={media.isOn} color="var(--flame)" intensity={media.isPlaying ? 0.32 : 0.15}>
      <div className="flex items-center gap-3">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-500"
          style={{ background: "var(--ink)", color: media.isOn ? "var(--flame)" : "var(--ash-dim)" }}
        >
          <div className="h-4 w-4">{media.resolvedIcon}</div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-[var(--parchment)]">{media.resolvedName}</div>
          <div className="mt-0.5 truncate font-[family-name:var(--font-mono)] text-xs text-[var(--ash)]">
            {media.mediaTitle ?? media.subtitle}
          </div>
        </div>
        {media.isOn && (
          <TransportRow
            isPlaying={media.isPlaying}
            onPrevious={media.previous}
            onPlayPause={() => (media.isPlaying ? media.pause() : media.play())}
            onNext={media.next}
            color="var(--flame)"
          />
        )}
      </div>
      {media.isOn && media.volumePct !== undefined && (
        <div className="mt-3">
          <VolumeRow value={volumeSlider.value} onChange={volumeSlider.onChange} color="var(--flame)" />
        </div>
      )}
    </GlowCard>
  )
}

function TileMediaPlayerCard({ media }: { media: MediaState }) {
  const volumeSlider = useLiveSlider(media.volumePct ?? 0, media.setVolume)

  return (
    <GlowCard active={media.isOn} color="var(--flame)" intensity={media.isPlaying ? 0.32 : 0.15}>
      <div className="flex items-center gap-3">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-500"
          style={{ background: "var(--ink)", color: media.isOn ? "var(--flame)" : "var(--ash-dim)" }}
        >
          <div className="h-4 w-4">{media.resolvedIcon}</div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-[var(--parchment)]">{media.resolvedName}</div>
          <div className="mt-0.5 truncate text-xs text-[var(--ash)]">{media.subtitle}</div>
        </div>
        {media.volumePct !== undefined && (
          <div className="shrink-0 font-[family-name:var(--font-mono)] text-xs" style={{ color: "var(--flame)" }}>
            {volumeSlider.value}%
          </div>
        )}
      </div>

      {media.isOn && (
        <div className="mt-3 flex gap-[3px]">
          <TransportRow
            isPlaying={media.isPlaying}
            onPrevious={media.previous}
            onPlayPause={() => (media.isPlaying ? media.pause() : media.play())}
            onNext={media.next}
            color="var(--flame)"
          />
        </div>
      )}

      {media.isOn && media.volumePct !== undefined && (
        <div className="mt-3">
          <VolumeRow value={volumeSlider.value} onChange={volumeSlider.onChange} color="var(--flame)" />
        </div>
      )}
    </GlowCard>
  )
}

function ArtMediaPlayerCard({ media }: { media: MediaState }) {
  const progressPct =
    media.duration && media.duration > 0 && media.position !== undefined
      ? Math.min(100, (media.position / media.duration) * 100)
      : 0

  return (
    <div
      className="overflow-hidden rounded-2xl border"
      style={{
        borderColor: media.isPlaying ? "var(--flame)" : "rgba(255,255,255,0.09)",
        background: "#000",
        boxShadow: media.isPlaying
          ? "0 0 26px -6px var(--flame)"
          : "0 0 3px 0 rgba(0,0,0,1), 0 0 8px 2px rgba(0,0,0,0.8)",
      }}
    >
      <div
        className="relative flex h-[150px] items-end"
        style={{
          backgroundImage: media.pictureUrl
            ? `url(${media.pictureUrl})`
            : "linear-gradient(135deg, #3a2f28, #241f1b)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {!media.pictureUrl && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ color: "var(--ash-dim)" }}
          >
            <div className="h-10 w-10">{media.resolvedIcon}</div>
          </div>
        )}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.55) 75%, rgba(0,0,0,0.88) 100%)",
          }}
        />
        <div className="relative w-full px-4 py-3">
          <div className="truncate font-medium text-[var(--parchment)]" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}>
            {media.mediaTitle ?? media.resolvedName}
          </div>
          <div className="mt-0.5 truncate text-xs text-[var(--ash)]">
            {media.mediaArtist ?? media.subtitle}
          </div>
        </div>
      </div>

      <div className="px-4 py-3.5">
        {media.duration !== undefined && media.duration > 0 && (
          <>
            <div className="relative h-[3px] rounded-full" style={{ background: "var(--seam)" }}>
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ width: `${progressPct}%`, background: "var(--flame)" }}
              />
            </div>
            <div className="mt-1.5 mb-3 flex justify-between font-[family-name:var(--font-mono)] text-[10px] text-[var(--ash-dim)]">
              <span>{formatTime(media.position)}</span>
              <span>{formatTime(media.duration)}</span>
            </div>
          </>
        )}
        <div className="flex justify-center">
          <TransportRow
            isPlaying={media.isPlaying}
            onPrevious={media.previous}
            onPlayPause={() => (media.isPlaying ? media.pause() : media.play())}
            onNext={media.next}
            color="var(--flame)"
            size="large"
          />
        </div>
      </div>
    </div>
  )
}

export function MediaPlayerTile({
  entityId,
  displayName,
  icon,
  style = "default",
}: {
  entityId: string
  displayName?: string
  icon?: ReactElement
  style?: MediaPlayerCardStyle
}) {
  const media = useMediaPlayerState(entityId, displayName, icon)
  if (!media) return null

  if (style === "tile") return <TileMediaPlayerCard media={media} />
  if (style === "art") return <ArtMediaPlayerCard media={media} />
  return <DefaultMediaPlayerCard media={media} />
}
