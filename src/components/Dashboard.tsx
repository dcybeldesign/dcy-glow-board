import { useEffect, useState } from "react"
import { useHomeAssistant } from "../hooks/useHomeAssistant"
import { useTranslation } from "../hooks/useTranslation"
import { useAreaGroups } from "../hooks/useAreaGroups"
import {
  resolveTabCardIds,
  resolveTabSections,
  useDashboardConfig,
  type CardLayout,
} from "../hooks/useDashboardConfig"
import { getRoomColor } from "../lib/roomVisuals"
import { renderIcon } from "../lib/iconCatalog"
import { RoomSection } from "./RoomSection"
import { RoomNav, SETTINGS_TAB_ID } from "./RoomNav"
import { SettingsPage } from "./SettingsPage"
import { IframeView } from "./IframeView"

export function Dashboard() {
  const { registriesLoaded } = useHomeAssistant()
  const { t } = useTranslation()
  const groups = useAreaGroups()
  const dashboardConfig = useDashboardConfig(groups)
  const [activeTabId, setActiveTabId] = useState<string | null>(null)

  const navTabs = [
    ...dashboardConfig.visibleTabs.map((tab) => ({
      id: tab.id,
      name: tab.name,
      icon: renderIcon(dashboardConfig.getTabIcon(tab.id)),
      color: dashboardConfig.getTabColor(tab.id),
    })),
    { id: SETTINGS_TAB_ID, name: t("nav.settings") },
  ]
  const navTabsKey = navTabs.map((t) => t.id).join("|")

  // Only snap back to the default tab when the tab we were actually looking
  // at disappears — unrelated tabs changing visibility shouldn't move us.
  useEffect(() => {
    if (activeTabId && !navTabs.some((t) => t.id === activeTabId)) {
      setActiveTabId(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navTabsKey])

  const resolvedActiveId = activeTabId ?? navTabs[0]?.id ?? SETTINGS_TAB_ID
  const activeIndex = Math.max(
    navTabs.findIndex((t) => t.id === resolvedActiveId),
    0,
  )

  if (!registriesLoaded) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10 text-sm text-[var(--ash)]">
        {t("dashboard.loadingAreas")}
      </div>
    )
  }

  if (groups.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10 text-sm text-[var(--ash)]">
        {t("dashboard.noAreas")}
      </div>
    )
  }

  const activeNavTab = navTabs[Math.min(activeIndex, navTabs.length - 1)]
  const isSettings = activeNavTab.id === SETTINGS_TAB_ID
  const activeTab = !isSettings
    ? dashboardConfig.visibleTabs.find((t) => t.id === activeNavTab.id)
    : undefined

  const activeColor = activeTab
    ? (dashboardConfig.getTabColor(activeTab.id) ?? getRoomColor(activeIndex))
    : getRoomColor(activeIndex)
  const activeSections = activeTab ? resolveTabSections(activeTab) : null
  const entityIds = activeTab && !activeSections ? resolveTabCardIds(activeTab) : []
  const onLayoutChange =
    activeTab && !activeSections
      ? (layout: CardLayout) => dashboardConfig.setTabLayout(activeTab.id, layout)
      : () => {}

  return (
    <div>
      <div
        className="sticky top-0 z-10 border-b px-4 py-3"
        style={{ borderColor: "var(--seam)", background: "var(--ink)" }}
      >
        <RoomNav
          rooms={navTabs}
          activeIndex={activeIndex}
          onSelect={(i) => setActiveTabId(navTabs[i]?.id ?? null)}
        />
      </div>
      <div className="max-w-5xl mx-auto px-6 py-6">
        {isSettings ? (
          <SettingsPage groups={groups} dashboardConfig={dashboardConfig} />
        ) : activeTab ? (
          activeTab.kind === "iframe" ? (
            <div>
              <div className="mb-5 text-center">
                <h2
                  className="font-[family-name:var(--font-display)] text-xl font-medium"
                  style={{
                    color: activeColor,
                    textShadow: `0 0 18px ${activeColor}55`,
                  }}
                >
                  {activeTab.name}
                </h2>
              </div>
              <IframeView name={activeTab.name} url={activeTab.url} />
            </div>
          ) : activeSections ? (
            <div>
              <div className="mb-5 text-center">
                <h2
                  className="font-[family-name:var(--font-display)] text-xl font-medium"
                  style={{
                    color: activeColor,
                    textShadow: `0 0 18px ${activeColor}55`,
                  }}
                >
                  {activeTab.name}
                </h2>
              </div>
              {activeSections.length > 0 ? (
                activeSections.map((section) => (
                  <RoomSection
                    key={section.id}
                    id={activeTab.id}
                    title={section.name}
                    color={activeColor}
                    entityIds={section.cardIds}
                    layout={section.layout}
                    onLayoutChange={(layout) =>
                      dashboardConfig.setSectionLayout(activeTab.id, section.id, layout)
                    }
                    dashboardConfig={dashboardConfig}
                  />
                ))
              ) : (
                <div
                  className="rounded-2xl border border-dashed px-4 py-6 text-center text-sm"
                  style={{ borderColor: "var(--seam)", color: "var(--ash-dim)" }}
                >
                  {t("dashboard.noSections")}
                </div>
              )}
            </div>
          ) : (
            <RoomSection
              id={activeTab.id}
              title={activeTab.name}
              color={activeColor}
              entityIds={entityIds}
              layout={activeTab.layout}
              onLayoutChange={onLayoutChange}
              dashboardConfig={dashboardConfig}
            />
          )
        ) : null}
      </div>
    </div>
  )
}
