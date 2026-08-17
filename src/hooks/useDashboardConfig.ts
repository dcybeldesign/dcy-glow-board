import { useEffect, useMemo, useState } from "react"
import type { AreaGroup } from "./useAreaGroups"
import {
  loadConfig,
  parseConfigJson,
  saveConfig,
  type AlarmCardStyle,
  type BinarySensorCardStyle,
  type CameraCardStyle,
  type CardColSpan,
  type CardLayout,
  type CardSection,
  type ClimateCardStyle,
  type CoverCardStyle,
  type DashboardConfig,
  type LightCardStyle,
  type LockCardStyle,
  type MediaPlayerCardStyle,
  type RoomSummaryStyle,
  type SensorCardStyle,
  type SensorRange,
  type TabConfig,
  type VacuumCardStyle,
  type WeatherCardView,
} from "../lib/dashboardConfig"

export type {
  CardSection,
  CardLayout,
  WeatherCardView,
  CardColSpan,
  SensorCardStyle,
  SensorRange,
  LightCardStyle,
  ClimateCardStyle,
  CoverCardStyle,
  LockCardStyle,
  BinarySensorCardStyle,
  RoomSummaryStyle,
  MediaPlayerCardStyle,
  CameraCardStyle,
  AlarmCardStyle,
  VacuumCardStyle,
}

export type ResolvedTab =
  | {
      kind: "area"
      id: string
      name: string
      visible: boolean
      group: AreaGroup
      cardIds?: string[]
      layout?: CardLayout
    }
  | {
      kind: "custom"
      id: string
      name: string
      visible: boolean
      cardIds: string[]
      layout?: CardLayout
      sectioned?: boolean
      sections?: CardSection[]
    }
  | {
      kind: "iframe"
      id: string
      name: string
      visible: boolean
      url: string
    }

export function resolveTabCardIds(tab: ResolvedTab): string[] {
  if (tab.kind === "custom") return tab.cardIds
  if (tab.kind === "iframe") return []
  if (tab.cardIds) return tab.cardIds
  return [
    ...tab.group.lightIds,
    ...tab.group.climateIds,
    ...tab.group.sensorIds,
    ...tab.group.otherIds,
  ]
}

export function resolveTabSections(tab: ResolvedTab): CardSection[] | null {
  if (tab.kind === "custom" && tab.sectioned && tab.sections) return tab.sections
  return null
}

export function useDashboardConfig(groups: AreaGroup[]) {
  const [config, setConfig] = useState<DashboardConfig>(() => loadConfig())

  useEffect(() => {
    saveConfig(config)
  }, [config])

  const groupIdsKey = groups.map((g) => g.areaId ?? "unassigned").join("|")

  // Future-proofing: any HA area without a stored tab entry yet (new room) gets
  // one automatically, visible by default.
  useEffect(() => {
    setConfig((prev) => {
      const known = new Set(prev.tabs.map((t) => t.id))
      const missing = groups
        .map((g) => g.areaId ?? "unassigned")
        .filter((id) => !known.has(id))
      if (missing.length === 0) return prev
      return {
        ...prev,
        tabs: [
          ...prev.tabs,
          ...missing.map((id): TabConfig => ({ id, kind: "area", visible: true })),
        ],
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupIdsKey])

  const groupById = useMemo(() => {
    const map = new Map<string, AreaGroup>()
    for (const g of groups) map.set(g.areaId ?? "unassigned", g)
    return map
  }, [groups])

  const allTabs: ResolvedTab[] = useMemo(() => {
    const resolved: ResolvedTab[] = []
    for (const t of config.tabs) {
      if (t.kind === "area") {
        const group = groupById.get(t.id)
        if (!group) continue
        resolved.push({
          kind: "area",
          id: t.id,
          name: group.name,
          visible: t.visible,
          group,
          cardIds: t.cardIds,
          layout: t.layout,
        })
      } else if (t.kind === "custom") {
        resolved.push({
          kind: "custom",
          id: t.id,
          name: t.name,
          visible: t.visible,
          cardIds: t.cardIds,
          layout: t.layout,
          sectioned: t.sectioned,
          sections: t.sections,
        })
      } else {
        resolved.push({
          kind: "iframe",
          id: t.id,
          name: t.name,
          visible: t.visible,
          url: t.url,
        })
      }
    }
    return resolved
  }, [config.tabs, groupById])

  const visibleTabs = useMemo(() => allTabs.filter((t) => t.visible), [allTabs])

  function setTabVisible(id: string, visible: boolean) {
    setConfig((prev) => ({
      ...prev,
      tabs: prev.tabs.map((t) => (t.id === id ? { ...t, visible } : t)),
    }))
  }

  function reorderTabs(order: string[]) {
    setConfig((prev) => {
      const byId = new Map(prev.tabs.map((t) => [t.id, t]))
      const reordered = order
        .map((id) => byId.get(id))
        .filter((t): t is TabConfig => t !== undefined)
      const remaining = prev.tabs.filter((t) => !order.includes(t.id))
      return { ...prev, tabs: [...reordered, ...remaining] }
    })
  }

  function addCustomTab(name: string, cardIds: string[]) {
    const id = `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
    setConfig((prev) => ({
      ...prev,
      tabs: [...prev.tabs, { id, kind: "custom", name, visible: true, cardIds }],
    }))
  }

  // Shared by custom and iframe tabs — the only two kinds a user can create
  // (and therefore remove) from Réglages; area tabs are derived from HA.
  function removeTab(id: string) {
    setConfig((prev) => ({
      ...prev,
      tabs: prev.tabs.filter((t) => t.id !== id),
    }))
  }

  function addIframeTab(name: string, url: string) {
    const id = `iframe-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
    setConfig((prev) => ({
      ...prev,
      tabs: [...prev.tabs, { id, kind: "iframe", name, visible: true, url }],
    }))
  }

  function setIframeUrl(tabId: string, url: string) {
    setConfig((prev) => ({
      ...prev,
      tabs: prev.tabs.map((t) => (t.id === tabId && t.kind === "iframe" ? { ...t, url } : t)),
    }))
  }

  function setTabCardIds(tabId: string, cardIds: string[]) {
    setConfig((prev) => ({
      ...prev,
      tabs: prev.tabs.map((t) => (t.id === tabId ? { ...t, cardIds } : t)),
    }))
  }

  function setTabLayout(tabId: string, layout: CardLayout) {
    setConfig((prev) => ({
      ...prev,
      tabs: prev.tabs.map((t) => (t.id === tabId ? { ...t, layout } : t)),
    }))
  }

  function setTabSectioned(tabId: string, sectioned: boolean) {
    setConfig((prev) => ({
      ...prev,
      tabs: prev.tabs.map((t) => {
        if (t.id !== tabId || t.kind !== "custom") return t
        return { ...t, sectioned, sections: t.sections ?? (sectioned ? [] : t.sections) }
      }),
    }))
  }

  function addSection(tabId: string, name: string): string {
    const sectionId = `section-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
    setConfig((prev) => ({
      ...prev,
      tabs: prev.tabs.map((t) => {
        if (t.id !== tabId || t.kind !== "custom") return t
        return { ...t, sections: [...(t.sections ?? []), { id: sectionId, name, cardIds: [] }] }
      }),
    }))
    return sectionId
  }

  function removeSection(tabId: string, sectionId: string) {
    setConfig((prev) => ({
      ...prev,
      tabs: prev.tabs.map((t) => {
        if (t.id !== tabId || t.kind !== "custom") return t
        return { ...t, sections: (t.sections ?? []).filter((s) => s.id !== sectionId) }
      }),
    }))
  }

  function setSectionCardIds(tabId: string, sectionId: string, cardIds: string[]) {
    setConfig((prev) => ({
      ...prev,
      tabs: prev.tabs.map((t) => {
        if (t.id !== tabId || t.kind !== "custom") return t
        return {
          ...t,
          sections: (t.sections ?? []).map((s) => (s.id === sectionId ? { ...s, cardIds } : s)),
        }
      }),
    }))
  }

  function setSectionLayout(tabId: string, sectionId: string, layout: CardLayout) {
    setConfig((prev) => ({
      ...prev,
      tabs: prev.tabs.map((t) => {
        if (t.id !== tabId || t.kind !== "custom") return t
        return {
          ...t,
          sections: (t.sections ?? []).map((s) => (s.id === sectionId ? { ...s, layout } : s)),
        }
      }),
    }))
  }

  function getCardName(entityId: string): string | undefined {
    return config.cardNames[entityId]
  }

  function setCardName(entityId: string, name: string) {
    setConfig((prev) => ({
      ...prev,
      cardNames: { ...prev.cardNames, [entityId]: name },
    }))
  }

  function resetCardName(entityId: string) {
    setConfig((prev) => {
      if (!(entityId in prev.cardNames)) return prev
      const next = { ...prev.cardNames }
      delete next[entityId]
      return { ...prev, cardNames: next }
    })
  }

  function getCardIcon(entityId: string): string | undefined {
    return config.cardIcons[entityId]
  }

  function setCardIcon(entityId: string, iconId: string) {
    setConfig((prev) => ({
      ...prev,
      cardIcons: { ...prev.cardIcons, [entityId]: iconId },
    }))
  }

  function resetCardIcon(entityId: string) {
    setConfig((prev) => {
      if (!(entityId in prev.cardIcons)) return prev
      const next = { ...prev.cardIcons }
      delete next[entityId]
      return { ...prev, cardIcons: next }
    })
  }

  function getTabIcon(tabId: string): string | undefined {
    return config.tabIcons[tabId]
  }

  function setTabIcon(tabId: string, iconId: string) {
    setConfig((prev) => ({
      ...prev,
      tabIcons: { ...prev.tabIcons, [tabId]: iconId },
    }))
  }

  function resetTabIcon(tabId: string) {
    setConfig((prev) => {
      if (!(tabId in prev.tabIcons)) return prev
      const next = { ...prev.tabIcons }
      delete next[tabId]
      return { ...prev, tabIcons: next }
    })
  }

  function getTabColor(tabId: string): string | undefined {
    return config.tabColors[tabId]
  }

  function setTabColor(tabId: string, color: string) {
    setConfig((prev) => ({
      ...prev,
      tabColors: { ...prev.tabColors, [tabId]: color },
    }))
  }

  function resetTabColor(tabId: string) {
    setConfig((prev) => {
      if (!(tabId in prev.tabColors)) return prev
      const next = { ...prev.tabColors }
      delete next[tabId]
      return { ...prev, tabColors: next }
    })
  }

  function getCardWeatherView(entityId: string): WeatherCardView {
    return config.cardWeatherView[entityId] ?? "day"
  }

  function setCardWeatherView(entityId: string, view: WeatherCardView) {
    setConfig((prev) => ({
      ...prev,
      cardWeatherView: { ...prev.cardWeatherView, [entityId]: view },
    }))
  }

  function getCardColSpan(entityId: string): CardColSpan {
    return config.cardColSpan[entityId] ?? 1
  }

  function setCardColSpan(entityId: string, span: CardColSpan) {
    setConfig((prev) => ({
      ...prev,
      cardColSpan: { ...prev.cardColSpan, [entityId]: span },
    }))
  }

  function getCardSensorStyle(entityId: string): SensorCardStyle {
    return config.cardSensorStyle[entityId] ?? "default"
  }

  function setCardSensorStyle(entityId: string, style: SensorCardStyle) {
    setConfig((prev) => ({
      ...prev,
      cardSensorStyle: { ...prev.cardSensorStyle, [entityId]: style },
    }))
  }

  function getCardSensorRange(entityId: string): SensorRange | undefined {
    return config.cardSensorRange[entityId]
  }

  function setCardSensorRange(entityId: string, range: SensorRange) {
    setConfig((prev) => ({
      ...prev,
      cardSensorRange: { ...prev.cardSensorRange, [entityId]: range },
    }))
  }

  function resetCardSensorRange(entityId: string) {
    setConfig((prev) => {
      if (!(entityId in prev.cardSensorRange)) return prev
      const next = { ...prev.cardSensorRange }
      delete next[entityId]
      return { ...prev, cardSensorRange: next }
    })
  }

  function getCardLightStyle(entityId: string): LightCardStyle {
    return config.cardLightStyle[entityId] ?? "default"
  }

  function setCardLightStyle(entityId: string, style: LightCardStyle) {
    setConfig((prev) => ({
      ...prev,
      cardLightStyle: { ...prev.cardLightStyle, [entityId]: style },
    }))
  }

  function getCardClimateStyle(entityId: string): ClimateCardStyle {
    return config.cardClimateStyle[entityId] ?? "default"
  }

  function setCardClimateStyle(entityId: string, style: ClimateCardStyle) {
    setConfig((prev) => ({
      ...prev,
      cardClimateStyle: { ...prev.cardClimateStyle, [entityId]: style },
    }))
  }

  function getCardCoverStyle(entityId: string): CoverCardStyle {
    return config.cardCoverStyle[entityId] ?? "default"
  }

  function setCardCoverStyle(entityId: string, style: CoverCardStyle) {
    setConfig((prev) => ({
      ...prev,
      cardCoverStyle: { ...prev.cardCoverStyle, [entityId]: style },
    }))
  }

  function getCardLockStyle(entityId: string): LockCardStyle {
    return config.cardLockStyle[entityId] ?? "default"
  }

  function setCardLockStyle(entityId: string, style: LockCardStyle) {
    setConfig((prev) => ({
      ...prev,
      cardLockStyle: { ...prev.cardLockStyle, [entityId]: style },
    }))
  }

  function getCardBinarySensorStyle(entityId: string): BinarySensorCardStyle {
    return config.cardBinarySensorStyle[entityId] ?? "default"
  }

  function setCardBinarySensorStyle(entityId: string, style: BinarySensorCardStyle) {
    setConfig((prev) => ({
      ...prev,
      cardBinarySensorStyle: { ...prev.cardBinarySensorStyle, [entityId]: style },
    }))
  }

  function getRoomSummaryStyle(id: string): RoomSummaryStyle {
    return config.roomSummaryStyle[id] ?? "text"
  }

  function setRoomSummaryStyle(id: string, style: RoomSummaryStyle) {
    setConfig((prev) => ({
      ...prev,
      roomSummaryStyle: { ...prev.roomSummaryStyle, [id]: style },
    }))
  }

  function getCardMediaPlayerStyle(entityId: string): MediaPlayerCardStyle {
    return config.cardMediaPlayerStyle[entityId] ?? "default"
  }

  function setCardMediaPlayerStyle(entityId: string, style: MediaPlayerCardStyle) {
    setConfig((prev) => ({
      ...prev,
      cardMediaPlayerStyle: { ...prev.cardMediaPlayerStyle, [entityId]: style },
    }))
  }

  function getCardCameraStyle(entityId: string): CameraCardStyle {
    return config.cardCameraStyle[entityId] ?? "default"
  }

  function setCardCameraStyle(entityId: string, style: CameraCardStyle) {
    setConfig((prev) => ({
      ...prev,
      cardCameraStyle: { ...prev.cardCameraStyle, [entityId]: style },
    }))
  }

  function getCardAlarmStyle(entityId: string): AlarmCardStyle {
    return config.cardAlarmStyle[entityId] ?? "default"
  }

  function setCardAlarmStyle(entityId: string, style: AlarmCardStyle) {
    setConfig((prev) => ({
      ...prev,
      cardAlarmStyle: { ...prev.cardAlarmStyle, [entityId]: style },
    }))
  }

  function getCardVacuumStyle(entityId: string): VacuumCardStyle {
    return config.cardVacuumStyle[entityId] ?? "default"
  }

  function setCardVacuumStyle(entityId: string, style: VacuumCardStyle) {
    setConfig((prev) => ({
      ...prev,
      cardVacuumStyle: { ...prev.cardVacuumStyle, [entityId]: style },
    }))
  }

  function exportConfigJson(): string {
    return JSON.stringify(config, null, 2)
  }

  // Returns false if the file isn't valid JSON, so the caller can show an error
  // instead of silently wiping the current config with an empty one.
  function importConfigJson(json: string): boolean {
    const parsed = parseConfigJson(json)
    if (!parsed) return false
    setConfig(parsed)
    return true
  }

  return {
    allTabs,
    visibleTabs,
    setTabVisible,
    reorderTabs,
    addCustomTab,
    removeTab,
    addIframeTab,
    setIframeUrl,
    setTabCardIds,
    setTabLayout,
    setTabSectioned,
    addSection,
    removeSection,
    setSectionCardIds,
    setSectionLayout,
    getCardName,
    setCardName,
    resetCardName,
    getCardIcon,
    setCardIcon,
    resetCardIcon,
    getTabIcon,
    setTabIcon,
    resetTabIcon,
    getTabColor,
    setTabColor,
    resetTabColor,
    getCardWeatherView,
    setCardWeatherView,
    getCardColSpan,
    setCardColSpan,
    getCardSensorStyle,
    setCardSensorStyle,
    getCardSensorRange,
    setCardSensorRange,
    resetCardSensorRange,
    getCardLightStyle,
    setCardLightStyle,
    getCardClimateStyle,
    setCardClimateStyle,
    getCardCoverStyle,
    setCardCoverStyle,
    getCardLockStyle,
    setCardLockStyle,
    getCardBinarySensorStyle,
    setCardBinarySensorStyle,
    getRoomSummaryStyle,
    setRoomSummaryStyle,
    getCardMediaPlayerStyle,
    setCardMediaPlayerStyle,
    getCardCameraStyle,
    setCardCameraStyle,
    getCardAlarmStyle,
    setCardAlarmStyle,
    getCardVacuumStyle,
    setCardVacuumStyle,
    exportConfigJson,
    importConfigJson,
  }
}

export type DashboardConfigApi = ReturnType<typeof useDashboardConfig>
