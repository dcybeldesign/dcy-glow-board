import { useRef, useState, type DragEvent, type ReactElement } from "react"
import { useHomeAssistant } from "../hooks/useHomeAssistant"
import { useEntity } from "../hooks/useEntity"
import { useTranslation } from "../hooks/useTranslation"
import type {
  AlarmCardStyle,
  BinarySensorCardStyle,
  CameraCardStyle,
  CardLayout,
  ClimateCardStyle,
  CoverCardStyle,
  DashboardConfigApi,
  LightCardStyle,
  LockCardStyle,
  MediaPlayerCardStyle,
  SensorCardStyle,
  SensorRange,
  VacuumCardStyle,
  WeatherCardView,
} from "../hooks/useDashboardConfig"
import type { TranslationKey } from "../lib/i18n"
import { SettingsIcon } from "../lib/roomVisuals"
import { renderIcon } from "../lib/iconCatalog"
import { GRID_COLUMNS, emptyCells, resolveGridPositions, snapshotLayout } from "../lib/gridLayout"
import { LightTile } from "./LightTile"
import { ClimateCard } from "./ClimateCard"
import { SensorTile } from "./SensorTile"
import { CoverTile } from "./CoverTile"
import { FanTile } from "./FanTile"
import { LockTile } from "./LockTile"
import { BinarySensorTile } from "./BinarySensorTile"
import { ActionTile } from "./ActionTile"
import { WeatherTile } from "./WeatherTile"
import { MediaPlayerTile } from "./MediaPlayerTile"
import { CameraTile } from "./CameraTile"
import { AlarmTile } from "./AlarmTile"
import { VacuumTile } from "./VacuumTile"
import { IconPicker } from "./IconPicker"

function GenericTile({
  entityId,
  displayName,
  icon,
}: {
  entityId: string
  displayName?: string
  icon?: ReactElement
}) {
  const entity = useEntity(entityId)
  if (!entity) return null

  return (
    <div
      className="rounded-2xl border p-4"
      style={{
        borderColor: "rgba(255,255,255,0.09)",
        background: "#000",
        boxShadow: "0 0 3px 0 rgba(0,0,0,1), 0 0 8px 2px rgba(0,0,0,0.8)",
      }}
    >
      <div className="mb-2 flex items-center gap-3">
        {icon && (
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
            style={{ background: "var(--ink)", color: "var(--ash)" }}
          >
            <div className="h-4 w-4">{icon}</div>
          </div>
        )}
        <div className="min-w-0 flex-1 truncate font-medium text-[var(--parchment)]">
          {displayName ?? entity.attributes.friendly_name ?? entityId}
        </div>
      </div>
      <div className="font-[family-name:var(--font-mono)] text-sm text-[var(--ash)]">
        {entity.state}
      </div>
    </div>
  )
}

const SENSOR_STYLES: { id: SensorCardStyle; label: TranslationKey }[] = [
  { id: "default", label: "style.sensor.default" },
  { id: "arc", label: "style.sensor.arc" },
  { id: "needle", label: "style.sensor.needle" },
  { id: "thermometer", label: "style.sensor.thermometer" },
  { id: "ring", label: "style.sensor.ring" },
]

const LIGHT_STYLES: { id: LightCardStyle; label: TranslationKey }[] = [
  { id: "default", label: "style.default" },
  { id: "tile", label: "style.light.tile" },
  { id: "wheel", label: "style.light.wheel" },
]

const CLIMATE_STYLES: { id: ClimateCardStyle; label: TranslationKey }[] = [
  { id: "default", label: "style.climate.default" },
  { id: "compact", label: "style.climate.compact" },
]

const COVER_STYLES: { id: CoverCardStyle; label: TranslationKey }[] = [
  { id: "default", label: "style.default" },
  { id: "tile", label: "style.cover.tile" },
]

const LOCK_STYLES: { id: LockCardStyle; label: TranslationKey }[] = [
  { id: "default", label: "style.default" },
  { id: "slide", label: "style.lock.slide" },
]

const BINARY_SENSOR_STYLES: { id: BinarySensorCardStyle; label: TranslationKey }[] = [
  { id: "default", label: "style.default" },
  { id: "timeline", label: "style.binarySensor.timeline" },
]

const MEDIA_PLAYER_STYLES: { id: MediaPlayerCardStyle; label: TranslationKey }[] = [
  { id: "default", label: "style.default" },
  { id: "tile", label: "style.mediaPlayer.tile" },
  { id: "art", label: "style.mediaPlayer.art" },
]

const CAMERA_STYLES: { id: CameraCardStyle; label: TranslationKey }[] = [
  { id: "default", label: "style.default" },
  { id: "preview", label: "style.camera.preview" },
]

const ALARM_STYLES: { id: AlarmCardStyle; label: TranslationKey }[] = [
  { id: "default", label: "style.default" },
  { id: "keypad", label: "style.alarm.keypad" },
]

const VACUUM_STYLES: { id: VacuumCardStyle; label: TranslationKey }[] = [
  { id: "default", label: "style.default" },
  { id: "tile", label: "style.vacuum.tile" },
]

const WEATHER_VIEWS: { id: WeatherCardView; label: TranslationKey }[] = [
  { id: "day", label: "style.weather.day" },
  { id: "hour", label: "style.weather.hour" },
  { id: "week", label: "style.weather.week" },
]

function StylePicker<T extends string>({
  options,
  value,
  onSelect,
}: {
  options: { id: T; label: TranslationKey }[]
  value: T
  onSelect: (id: T) => void
}) {
  const { t } = useTranslation()
  return (
    <div className="mb-3">
      <label className="mb-1 block text-xs text-[var(--ash)]">{t("style.label")}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            className="rounded-full border px-3 py-1 text-xs transition-colors"
            style={
              value === option.id
                ? { borderColor: "var(--flame)", color: "var(--ink)", background: "var(--flame)" }
                : { borderColor: "var(--seam)", color: "var(--ash)" }
            }
          >
            {t(option.label)}
          </button>
        ))}
      </div>
    </div>
  )
}

function GripIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <circle cx="8" cy="6" r="1.6" />
      <circle cx="16" cy="6" r="1.6" />
      <circle cx="8" cy="12" r="1.6" />
      <circle cx="16" cy="12" r="1.6" />
      <circle cx="8" cy="18" r="1.6" />
      <circle cx="16" cy="18" r="1.6" />
    </svg>
  )
}

function renderCard(
  entityId: string,
  displayName?: string,
  icon?: ReactElement,
  weatherView?: WeatherCardView,
  sensorStyle?: SensorCardStyle,
  sensorRange?: SensorRange,
  lightStyle?: LightCardStyle,
  climateStyle?: ClimateCardStyle,
  coverStyle?: CoverCardStyle,
  lockStyle?: LockCardStyle,
  binarySensorStyle?: BinarySensorCardStyle,
  mediaPlayerStyle?: MediaPlayerCardStyle,
  cameraStyle?: CameraCardStyle,
  alarmStyle?: AlarmCardStyle,
  vacuumStyle?: VacuumCardStyle,
) {
  const domain = entityId.split(".")[0]
  if (domain === "light" || domain === "switch") {
    return <LightTile entityId={entityId} displayName={displayName} icon={icon} style={lightStyle} />
  }
  if (domain === "climate") {
    return <ClimateCard entityId={entityId} displayName={displayName} style={climateStyle} />
  }
  if (domain === "sensor") {
    return (
      <SensorTile
        entityId={entityId}
        displayName={displayName}
        icon={icon}
        style={sensorStyle}
        range={sensorRange}
      />
    )
  }
  if (domain === "cover") {
    return <CoverTile entityId={entityId} displayName={displayName} icon={icon} style={coverStyle} />
  }
  if (domain === "fan") return <FanTile entityId={entityId} displayName={displayName} icon={icon} />
  if (domain === "lock") {
    return <LockTile entityId={entityId} displayName={displayName} icon={icon} style={lockStyle} />
  }
  if (domain === "binary_sensor") {
    return (
      <BinarySensorTile
        entityId={entityId}
        displayName={displayName}
        icon={icon}
        style={binarySensorStyle}
      />
    )
  }
  if (domain === "button" || domain === "scene" || domain === "script") {
    return <ActionTile entityId={entityId} displayName={displayName} icon={icon} />
  }
  if (domain === "weather") {
    return <WeatherTile entityId={entityId} displayName={displayName} view={weatherView} />
  }
  if (domain === "media_player") {
    return (
      <MediaPlayerTile entityId={entityId} displayName={displayName} icon={icon} style={mediaPlayerStyle} />
    )
  }
  if (domain === "camera") {
    return <CameraTile entityId={entityId} displayName={displayName} style={cameraStyle} />
  }
  if (domain === "alarm_control_panel") {
    return <AlarmTile entityId={entityId} displayName={displayName} style={alarmStyle} />
  }
  if (domain === "vacuum") {
    return <VacuumTile entityId={entityId} displayName={displayName} style={vacuumStyle} />
  }
  return <GenericTile entityId={entityId} displayName={displayName} icon={icon} />
}

export function CardGrid({
  entityIds,
  layout,
  onLayoutChange,
  dashboardConfig,
}: {
  entityIds: string[]
  layout?: CardLayout
  onLayoutChange: (layout: CardLayout) => void
  dashboardConfig: DashboardConfigApi
}) {
  const { entities } = useHomeAssistant()
  const { t } = useTranslation()
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [hoveredCell, setHoveredCell] = useState<string | null>(null)
  const [openSettingsId, setOpenSettingsId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState("")
  // Only one card's settings panel is ever open at a time, so these two refs
  // are safe to share across the whole grid instead of keying per card.
  const sensorMinRef = useRef<HTMLInputElement>(null)
  const sensorMaxRef = useRef<HTMLInputElement>(null)

  function commitSensorRange(id: string) {
    const minStr = sensorMinRef.current?.value
    const maxStr = sensorMaxRef.current?.value
    if (!minStr || !maxStr) return
    const min = Number(minStr)
    const max = Number(maxStr)
    if (!Number.isFinite(min) || !Number.isFinite(max) || min >= max) return
    dashboardConfig.setCardSensorRange(id, { min, max })
  }

  const cells = resolveGridPositions(entityIds, layout, (id) => dashboardConfig.getCardColSpan(id))
  const cellById = new Map(cells.map((c) => [c.id, c]))
  const empties = draggedId ? emptyCells(cells) : []

  function handleCellDragOver(e: DragEvent<HTMLDivElement>, row: number, col: number) {
    e.preventDefault()
    const key = `${row}-${col}`
    if (hoveredCell !== key) setHoveredCell(key)
  }

  function handleCellDrop(e: DragEvent<HTMLDivElement>, targetRow: number, targetCol: number) {
    e.preventDefault()
    setHoveredCell(null)
    if (!draggedId) return
    const draggedCell = cellById.get(draggedId)
    if (!draggedCell) return
    const span = draggedCell.colSpan
    const clampedCol = Math.min(targetCol, GRID_COLUMNS - span)
    if (draggedCell.row === targetRow && draggedCell.col === clampedCol) return

    const snapshot = snapshotLayout(cells)
    const targetKeys = new Set(
      Array.from({ length: span }, (_, i) => `${targetRow}-${clampedCol + i}`),
    )
    // Anything the wider dragged card would now overlap loses its explicit spot and
    // falls back to auto-flow — swapping spans of different widths isn't worth the complexity.
    const displaced = cells.filter((c) => {
      if (c.id === draggedId) return false
      for (let i = 0; i < c.colSpan; i++) {
        if (targetKeys.has(`${c.row}-${c.col + i}`)) return true
      }
      return false
    })
    for (const c of displaced) delete snapshot[c.id]
    snapshot[draggedId] = { row: targetRow, col: clampedCol }
    onLayoutChange(snapshot)
  }

  function toggleSettings(id: string, currentDisplay: string) {
    if (openSettingsId === id) {
      setOpenSettingsId(null)
    } else {
      setDraftName(currentDisplay)
      setOpenSettingsId(id)
    }
  }

  function saveName(id: string) {
    const trimmed = draftName.trim()
    if (trimmed) dashboardConfig.setCardName(id, trimmed)
    setOpenSettingsId(null)
  }

  function resetName(id: string) {
    dashboardConfig.resetCardName(id)
    setOpenSettingsId(null)
  }

  return (
    <div
      className="grid gap-3"
      style={{ gridTemplateColumns: `repeat(${GRID_COLUMNS}, minmax(0,1fr))`, gridAutoRows: "min-content" }}
    >
      {cells.map(({ id, row, col, colSpan }, index) => {
        const domain = id.split(".")[0]
        const override = dashboardConfig.getCardName(id)
        const realName = (entities[id]?.attributes.friendly_name as string | undefined) ?? id
        const displayName = override ?? realName
        const iconId = dashboardConfig.getCardIcon(id)
        const icon = renderIcon(iconId)
        const isSettingsOpen = openSettingsId === id
        const weatherView = dashboardConfig.getCardWeatherView(id)
        const sensorStyle = dashboardConfig.getCardSensorStyle(id)
        const sensorRange = dashboardConfig.getCardSensorRange(id)
        const lightStyle = dashboardConfig.getCardLightStyle(id)
        const climateStyle = dashboardConfig.getCardClimateStyle(id)
        const coverStyle = dashboardConfig.getCardCoverStyle(id)
        const lockStyle = dashboardConfig.getCardLockStyle(id)
        const binarySensorStyle = dashboardConfig.getCardBinarySensorStyle(id)
        const mediaPlayerStyle = dashboardConfig.getCardMediaPlayerStyle(id)
        const cameraStyle = dashboardConfig.getCardCameraStyle(id)
        const alarmStyle = dashboardConfig.getCardAlarmStyle(id)
        const vacuumStyle = dashboardConfig.getCardVacuumStyle(id)

        return (
          <div
            key={id}
            className="group relative card-hover card-enter transition-opacity"
            style={{
              gridColumn: `${col + 1} / span ${colSpan}`,
              gridRow: row + 1,
              opacity: draggedId === id ? 0.4 : 1,
              animationDelay: `${index * 30}ms`,
            }}
            onDragOver={(e) => handleCellDragOver(e, row, col)}
            onDrop={(e) => handleCellDrop(e, row, col)}
          >
            <div
              draggable
              onDragStart={() => setDraggedId(id)}
              onDragEnd={() => {
                setDraggedId(null)
                setHoveredCell(null)
              }}
              aria-label={t("card.reorderAria")}
              className="absolute left-2 top-2 z-10 flex h-10 w-10 cursor-grab items-center justify-center rounded-lg opacity-0 transition-opacity group-hover:opacity-90 hover:!bg-[var(--ember-hover)] active:cursor-grabbing"
              style={{ color: "var(--parchment)" }}
            >
              <GripIcon />
            </div>

            <div className="absolute right-2 top-2 z-10 flex items-center gap-1">
              <button
                type="button"
                onClick={() => toggleSettings(id, displayName)}
                aria-label={t("card.settingsAria")}
                aria-expanded={isSettingsOpen}
                className="flex h-6 w-6 items-center justify-center rounded-md opacity-0 transition-opacity group-hover:opacity-70 hover:!opacity-100"
                style={{ color: isSettingsOpen ? "var(--flame)" : "var(--parchment)" }}
              >
                <div className="h-3.5 w-3.5">
                  <SettingsIcon />
                </div>
              </button>
            </div>

            {renderCard(
              id,
              displayName,
              icon,
              weatherView,
              sensorStyle,
              sensorRange,
              lightStyle,
              climateStyle,
              coverStyle,
              lockStyle,
              binarySensorStyle,
              mediaPlayerStyle,
              cameraStyle,
              alarmStyle,
              vacuumStyle,
            )}

            {isSettingsOpen && (
              <div
                className="mt-2 rounded-xl border p-3"
                style={{ borderColor: "var(--seam)", background: "#000" }}
              >
                <label className="mb-1 block text-xs text-[var(--ash)]">{t("card.displayName")}</label>
                <input
                  type="text"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder={realName}
                  className="mb-2 w-full rounded-lg border bg-transparent px-2.5 py-1.5 text-sm text-[var(--parchment)] outline-none"
                  style={{ borderColor: "var(--seam)" }}
                />
                <div className="mb-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => resetName(id)}
                    disabled={!override}
                    className="rounded-full px-2.5 py-1 text-xs text-[var(--ash)] transition-colors hover:text-[var(--parchment)] disabled:opacity-40"
                  >
                    {t("common.reset")}
                  </button>
                  <button
                    type="button"
                    onClick={() => saveName(id)}
                    disabled={!draftName.trim()}
                    className="rounded-full px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-40"
                    style={{ background: "var(--flame)", color: "var(--ink)" }}
                  >
                    {t("common.save")}
                  </button>
                </div>

                <div className="mb-3">
                  <label className="mb-1 block text-xs text-[var(--ash)]">{t("card.width")}</label>
                  <div className="flex gap-2">
                    {([1, 2, 3] as const).map((span) => (
                      <button
                        key={span}
                        type="button"
                        onClick={() => dashboardConfig.setCardColSpan(id, span)}
                        className="rounded-full border px-3 py-1 text-xs transition-colors"
                        style={
                          dashboardConfig.getCardColSpan(id) === span
                            ? { borderColor: "var(--flame)", color: "var(--ink)", background: "var(--flame)" }
                            : { borderColor: "var(--seam)", color: "var(--ash)" }
                        }
                      >
                        {t("card.widthCol", { n: span })}
                      </button>
                    ))}
                  </div>
                </div>

                {(domain === "light" || domain === "switch") && (
                  <StylePicker options={LIGHT_STYLES} value={lightStyle} onSelect={(v) => dashboardConfig.setCardLightStyle(id, v)} />
                )}

                {domain === "climate" && (
                  <StylePicker options={CLIMATE_STYLES} value={climateStyle} onSelect={(v) => dashboardConfig.setCardClimateStyle(id, v)} />
                )}

                {domain === "cover" && (
                  <StylePicker options={COVER_STYLES} value={coverStyle} onSelect={(v) => dashboardConfig.setCardCoverStyle(id, v)} />
                )}

                {domain === "lock" && (
                  <StylePicker options={LOCK_STYLES} value={lockStyle} onSelect={(v) => dashboardConfig.setCardLockStyle(id, v)} />
                )}

                {domain === "binary_sensor" && (
                  <StylePicker
                    options={BINARY_SENSOR_STYLES}
                    value={binarySensorStyle}
                    onSelect={(v) => dashboardConfig.setCardBinarySensorStyle(id, v)}
                  />
                )}

                {domain === "media_player" && (
                  <StylePicker
                    options={MEDIA_PLAYER_STYLES}
                    value={mediaPlayerStyle}
                    onSelect={(v) => dashboardConfig.setCardMediaPlayerStyle(id, v)}
                  />
                )}

                {domain === "camera" && (
                  <StylePicker
                    options={CAMERA_STYLES}
                    value={cameraStyle}
                    onSelect={(v) => dashboardConfig.setCardCameraStyle(id, v)}
                  />
                )}

                {domain === "alarm_control_panel" && (
                  <StylePicker
                    options={ALARM_STYLES}
                    value={alarmStyle}
                    onSelect={(v) => dashboardConfig.setCardAlarmStyle(id, v)}
                  />
                )}

                {domain === "vacuum" && (
                  <StylePicker
                    options={VACUUM_STYLES}
                    value={vacuumStyle}
                    onSelect={(v) => dashboardConfig.setCardVacuumStyle(id, v)}
                  />
                )}

                {domain !== "climate" && domain !== "weather" && (
                  <div>
                    <label className="mb-1 block text-xs text-[var(--ash)]">{t("card.icon")}</label>
                    <IconPicker
                      selectedId={iconId}
                      onSelect={(nextId) => dashboardConfig.setCardIcon(id, nextId)}
                      onReset={() => dashboardConfig.resetCardIcon(id)}
                    />
                  </div>
                )}

                {domain === "weather" && (
                  <div>
                    <label className="mb-1 block text-xs text-[var(--ash)]">{t("card.view")}</label>
                    <div className="flex gap-2">
                      {WEATHER_VIEWS.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => dashboardConfig.setCardWeatherView(id, option.id)}
                          className="rounded-full border px-3 py-1 text-xs transition-colors"
                          style={
                            weatherView === option.id
                              ? { borderColor: "var(--flame)", color: "var(--ink)", background: "var(--flame)" }
                              : { borderColor: "var(--seam)", color: "var(--ash)" }
                          }
                        >
                          {t(option.label)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {domain === "sensor" && (
                  <div>
                    <label className="mb-1 block text-xs text-[var(--ash)]">{t("style.label")}</label>
                    <div className="mb-3 flex flex-wrap gap-2">
                      {SENSOR_STYLES.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => dashboardConfig.setCardSensorStyle(id, option.id)}
                          className="rounded-full border px-3 py-1 text-xs transition-colors"
                          style={
                            sensorStyle === option.id
                              ? { borderColor: "var(--flame)", color: "var(--ink)", background: "var(--flame)" }
                              : { borderColor: "var(--seam)", color: "var(--ash)" }
                          }
                        >
                          {t(option.label)}
                        </button>
                      ))}
                    </div>

                    {sensorStyle !== "default" && (
                      <div>
                        <label className="mb-1 block text-xs text-[var(--ash)]">{t("card.range")}</label>
                        <div className="flex items-center gap-2">
                          <input
                            key={`${id}-min-${sensorRange?.min ?? "auto"}`}
                            ref={sensorMinRef}
                            type="number"
                            defaultValue={sensorRange?.min}
                            placeholder="min"
                            onBlur={() => commitSensorRange(id)}
                            className="w-20 rounded-lg border bg-transparent px-2 py-1 text-sm text-[var(--parchment)] outline-none"
                            style={{ borderColor: "var(--seam)" }}
                          />
                          <span className="text-xs text-[var(--ash-dim)]">→</span>
                          <input
                            key={`${id}-max-${sensorRange?.max ?? "auto"}`}
                            ref={sensorMaxRef}
                            type="number"
                            defaultValue={sensorRange?.max}
                            placeholder="max"
                            onBlur={() => commitSensorRange(id)}
                            className="w-20 rounded-lg border bg-transparent px-2 py-1 text-sm text-[var(--parchment)] outline-none"
                            style={{ borderColor: "var(--seam)" }}
                          />
                          <button
                            type="button"
                            onClick={() => dashboardConfig.resetCardSensorRange(id)}
                            disabled={!sensorRange}
                            className="rounded-full px-2.5 py-1 text-xs text-[var(--ash)] transition-colors hover:text-[var(--parchment)] disabled:opacity-40"
                          >
                            {t("common.auto")}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {empties.map(({ row, col }) => {
        const isHovered = hoveredCell === `${row}-${col}`
        return (
          <div
            key={`empty-${row}-${col}`}
            onDragOver={(e) => handleCellDragOver(e, row, col)}
            onDragLeave={() => setHoveredCell((prev) => (prev === `${row}-${col}` ? null : prev))}
            onDrop={(e) => handleCellDrop(e, row, col)}
            className="rounded-2xl border border-dashed transition-colors duration-150"
            style={{
              gridColumn: col + 1,
              gridRow: row + 1,
              borderColor: isHovered ? "var(--flame)" : "var(--seam)",
              background: isHovered ? "rgba(255,179,71,0.08)" : "transparent",
              minHeight: 64,
            }}
          />
        )
      })}
    </div>
  )
}
