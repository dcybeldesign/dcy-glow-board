import { useMemo, useRef, useState, type ChangeEvent, type DragEvent } from "react"
import type { AreaGroup } from "../hooks/useAreaGroups"
import { resolveTabCardIds, type DashboardConfigApi } from "../hooks/useDashboardConfig"
import { useHomeAssistant } from "../hooks/useHomeAssistant"
import { useTranslation } from "../hooks/useTranslation"
import { useUnits } from "../hooks/useUnits"
import type { UnitSystem } from "../lib/units"
import { IconPicker } from "./IconPicker"
import { ColorPicker } from "./ColorPicker"
import { getRoomColor } from "../lib/roomVisuals"

type EntitiesById = Record<string, { attributes: Record<string, unknown> }>
type ChecklistSection = { key: string; label: string; ids: string[] }

function friendlyName(entities: EntitiesById, id: string): string {
  return (entities[id]?.attributes.friendly_name as string | undefined) ?? id
}

function useChecklistSections(groups: AreaGroup[], showAll: boolean): ChecklistSection[] {
  const { entities } = useHomeAssistant()

  return useMemo(() => {
    if (!showAll) {
      return groups
        .map((group) => ({
          key: group.areaId ?? "unassigned",
          label: group.name,
          ids: [
            ...group.lightIds,
            ...group.climateIds,
            ...group.sensorIds,
            ...group.otherIds,
          ],
        }))
        .filter((section) => section.ids.length > 0)
    }

    const byDomain = new Map<string, string[]>()
    for (const id of Object.keys(entities)) {
      const domain = id.split(".")[0]
      const list = byDomain.get(domain) ?? []
      list.push(id)
      byDomain.set(domain, list)
    }
    return Array.from(byDomain.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([domain, ids]) => ({
        key: domain,
        label: domain,
        ids: ids.sort((a, b) => friendlyName(entities, a).localeCompare(friendlyName(entities, b))),
      }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups, showAll, entities])
}

function CardChecklist({
  sections,
  entities,
  selected,
  onToggle,
}: {
  sections: ChecklistSection[]
  entities: EntitiesById
  selected: Set<string>
  onToggle: (id: string) => void
}) {
  const { t } = useTranslation()
  const [query, setQuery] = useState("")
  const q = query.trim().toLowerCase()

  const filteredSections = q
    ? sections
        .map((section) => ({
          ...section,
          ids: section.ids.filter(
            (id) =>
              friendlyName(entities, id).toLowerCase().includes(q) ||
              id.toLowerCase().includes(q),
          ),
        }))
        .filter((section) => section.ids.length > 0)
    : sections

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("settings.searchEntity")}
        className="mb-2 w-full rounded-lg border bg-transparent px-2.5 py-1.5 text-sm text-[var(--parchment)] outline-none"
        style={{ borderColor: "var(--seam)" }}
      />
      <div
        className="max-h-72 overflow-y-auto rounded-lg border p-2"
        style={{ borderColor: "var(--seam)" }}
      >
        {filteredSections.length === 0 && (
          <div className="px-1.5 py-2 text-xs text-[var(--ash-dim)]">{t("common.noResults")}</div>
        )}
        {filteredSections.map((section) => (
          <div key={section.key} className="mb-2">
            <div className="mb-1 text-[11px] uppercase tracking-wide text-[var(--ash-dim)]">
              {section.label}
            </div>
            {section.ids.map((id) => (
              <label
                key={id}
                className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-sm text-[var(--parchment)] hover:bg-[var(--ember-hover)]"
              >
                <input
                  type="checkbox"
                  checked={selected.has(id)}
                  onChange={() => onToggle(id)}
                  className="accent-[var(--flame)]"
                />
                {friendlyName(entities, id)}
              </label>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function Switch({
  on,
  onToggle,
  label,
}: {
  on: boolean
  onToggle: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      aria-label={label}
      className="box-content flex h-5 w-9 shrink-0 items-center rounded-full border-0 p-0.5 transition-colors duration-300"
      style={{
        background: on ? "var(--flame)" : "var(--seam)",
        justifyContent: on ? "flex-end" : "flex-start",
      }}
    >
      <span className="block h-4 w-4 rounded-full bg-[var(--ink)] transition-transform duration-300" />
    </button>
  )
}

export function SettingsPage({
  groups,
  dashboardConfig,
}: {
  groups: AreaGroup[]
  dashboardConfig: DashboardConfigApi
}) {
  const { entities } = useHomeAssistant()
  const { t, language, setLanguage } = useTranslation()
  const { unitSystem, setUnitSystem } = useUnits()
  const {
    allTabs,
    visibleTabs,
    setTabVisible,
    reorderTabs,
    addCustomTab,
    removeTab,
    addIframeTab,
    setIframeUrl,
    setTabCardIds,
    setTabSectioned,
    addSection,
    removeSection,
    setSectionCardIds,
    getTabIcon,
    setTabIcon,
    resetTabIcon,
    getTabColor,
    setTabColor,
    resetTabColor,
    getRoomSummaryStyle,
    setRoomSummaryStyle,
    exportConfigJson,
    importConfigJson,
  } = dashboardConfig
  const [openTabId, setOpenTabId] = useState<string | null>(null)
  const [importMessage, setImportMessage] = useState<{ text: string; isError: boolean } | null>(
    null,
  )
  const importInputRef = useRef<HTMLInputElement>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState("")
  const [newSelected, setNewSelected] = useState<Set<string>>(new Set())
  const [isAddingIframe, setIsAddingIframe] = useState(false)
  const [newIframeName, setNewIframeName] = useState("")
  const [newIframeUrl, setNewIframeUrl] = useState("")
  const [showAllEntities, setShowAllEntities] = useState(false)
  const [openSectionId, setOpenSectionId] = useState<string | null>(null)
  const [isAddingSection, setIsAddingSection] = useState(false)
  const [newSectionName, setNewSectionName] = useState("")
  const [draggedTabId, setDraggedTabId] = useState<string | null>(null)

  function handleTabDragOver(e: DragEvent<HTMLDivElement>, overId: string) {
    e.preventDefault()
    if (!draggedTabId || draggedTabId === overId) return
    const ids = allTabs.map((t) => t.id)
    const from = ids.indexOf(draggedTabId)
    const to = ids.indexOf(overId)
    if (from === -1 || to === -1) return
    const next = [...ids]
    next.splice(from, 1)
    next.splice(to, 0, draggedTabId)
    reorderTabs(next)
  }

  const sections = useChecklistSections(groups, showAllEntities)
  const openTab = allTabs.find((t) => t.id === openTabId)

  function openTabPanel(id: string) {
    setIsAdding(false)
    setIsAddingIframe(false)
    setOpenSectionId(null)
    setIsAddingSection(false)
    setOpenTabId((prev) => (prev === id ? null : id))
  }

  function toggleSubSection(sectionId: string) {
    setIsAddingSection(false)
    setOpenSectionId((prev) => (prev === sectionId ? null : sectionId))
  }

  function startAddingSection() {
    setOpenSectionId(null)
    setIsAddingSection(true)
    setNewSectionName("")
  }

  function confirmAddSection(tabId: string) {
    const name = newSectionName.trim()
    if (!name) return
    const id = addSection(tabId, name)
    setIsAddingSection(false)
    setOpenSectionId(id)
  }

  function toggleSectionCard(tabId: string, sectionId: string, current: string[], id: string) {
    const next = current.includes(id) ? current.filter((c) => c !== id) : [...current, id]
    setSectionCardIds(tabId, sectionId, next)
  }

  function toggleOpenTabCard(id: string) {
    if (!openTab) return
    const current = resolveTabCardIds(openTab)
    const next = current.includes(id) ? current.filter((c) => c !== id) : [...current, id]
    setTabCardIds(openTab.id, next)
  }

  function startAdding() {
    setOpenTabId(null)
    setIsAddingIframe(false)
    setIsAdding(true)
    setNewName("")
    setNewSelected(new Set())
  }

  function startAddingIframe() {
    setOpenTabId(null)
    setIsAdding(false)
    setIsAddingIframe(true)
    setNewIframeName("")
    setNewIframeUrl("")
  }

  function confirmAddIframe() {
    const name = newIframeName.trim()
    if (!name) return
    addIframeTab(name, newIframeUrl.trim())
    setIsAddingIframe(false)
  }

  function toggleNewCard(id: string) {
    setNewSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function confirmAdd() {
    const name = newName.trim()
    if (!name) return
    addCustomTab(name, Array.from(newSelected))
    setIsAdding(false)
  }

  function handleExport() {
    const blob = new Blob([exportConfigJson()], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `dashboard-config-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function triggerImport() {
    setImportMessage(null)
    importInputRef.current?.click()
  }

  function handleImportFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    if (!window.confirm(t("settings.importConfirm"))) {
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const ok = importConfigJson(String(reader.result))
      setImportMessage(
        ok
          ? { text: t("settings.importSuccess"), isError: false }
          : { text: t("settings.importInvalid"), isError: true },
      )
    }
    reader.onerror = () => setImportMessage({ text: t("settings.importReadError"), isError: true })
    reader.readAsText(file)
  }

  const iframeExamples = (
    <p className="text-xs text-[var(--ash-dim)]">
      {t("settings.iframeExamplesPre")}
      <code>http://&lt;ha-address&gt;:8095</code>
      {t("settings.iframeExamplesMusicAssistantSuffix")}
      <code>http://&lt;ha-address&gt;:6052</code>
      {t("settings.iframeExamplesEsphomeSuffix")}
      <code>http://&lt;camera-ip&gt;</code>
      {t("settings.iframeExamplesEnd")}
    </p>
  )

  return (
    <section className="mb-9">
      <div className="mb-5 text-center">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-medium text-[var(--parchment)]">
          {t("settings.title")}
        </h2>
      </div>

      <div className="mb-5">
        <h3 className="mb-1 text-xs uppercase tracking-wide text-[var(--ash)]">
          {t("settings.language")}
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setLanguage("en")}
            className="rounded-full border px-3 py-1.5 text-sm transition-colors"
            style={
              language === "en"
                ? { borderColor: "var(--flame)", color: "var(--ink)", background: "var(--flame)" }
                : { borderColor: "var(--seam)", color: "var(--ash)" }
            }
          >
            {t("settings.languageEnglish")}
          </button>
          <button
            type="button"
            onClick={() => setLanguage("fr")}
            className="rounded-full border px-3 py-1.5 text-sm transition-colors"
            style={
              language === "fr"
                ? { borderColor: "var(--flame)", color: "var(--ink)", background: "var(--flame)" }
                : { borderColor: "var(--seam)", color: "var(--ash)" }
            }
          >
            {t("settings.languageFrench")}
          </button>
        </div>
      </div>

      <div className="mb-5">
        <h3 className="mb-1 text-xs uppercase tracking-wide text-[var(--ash)]">
          {t("settings.units")}
        </h3>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["auto", "settings.unitsAuto"],
              ["metric", "settings.unitsMetric"],
              ["imperial", "settings.unitsImperial"],
            ] as [UnitSystem, "settings.unitsAuto" | "settings.unitsMetric" | "settings.unitsImperial"][]
          ).map(([value, labelKey]) => (
            <button
              key={value}
              type="button"
              onClick={() => setUnitSystem(value)}
              className="rounded-full border px-3 py-1.5 text-sm transition-colors"
              style={
                unitSystem === value
                  ? { borderColor: "var(--flame)", color: "var(--ink)", background: "var(--flame)" }
                  : { borderColor: "var(--seam)", color: "var(--ash)" }
              }
            >
              {t(labelKey)}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <h3 className="mb-1 text-xs uppercase tracking-wide text-[var(--ash)]">
          {t("settings.configBackupTitle")}
        </h3>
        <p className="mb-3 text-xs text-[var(--ash-dim)]">{t("settings.configBackupBody")}</p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="rounded-full border px-3 py-1.5 text-sm text-[var(--parchment)] transition-colors hover:bg-[var(--ember-hover)]"
            style={{ borderColor: "var(--seam)" }}
          >
            {t("settings.export")}
          </button>
          <button
            type="button"
            onClick={triggerImport}
            className="rounded-full border px-3 py-1.5 text-sm text-[var(--parchment)] transition-colors hover:bg-[var(--ember-hover)]"
            style={{ borderColor: "var(--seam)" }}
          >
            {t("settings.import")}
          </button>
          <input
            ref={importInputRef}
            type="file"
            accept="application/json"
            onChange={handleImportFile}
            className="hidden"
          />
          {importMessage && (
            <span
              className="text-xs"
              style={{ color: importMessage.isError ? "var(--danger)" : "var(--ash)" }}
            >
              {importMessage.text}
            </span>
          )}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="mb-1 text-xs uppercase tracking-wide text-[var(--ash)]">
          {t("settings.menuTabsTitle")}
        </h3>
        <p className="mb-3 text-xs text-[var(--ash-dim)]">{t("settings.menuTabsBody")}</p>
        <div className="flex flex-wrap gap-2">
          {allTabs.map((tab) => (
            <div
              key={tab.id}
              draggable
              onDragStart={() => setDraggedTabId(tab.id)}
              onDragEnd={() => setDraggedTabId(null)}
              onDragOver={(e) => handleTabDragOver(e, tab.id)}
              onDrop={(e) => e.preventDefault()}
              className="flex cursor-grab items-center active:cursor-grabbing"
              style={{ opacity: draggedTabId === tab.id ? 0.4 : 1 }}
            >
              <button
                type="button"
                onClick={() => openTabPanel(tab.id)}
                className="rounded-full border px-3 py-1.5 text-sm transition-colors"
                style={
                  tab.id === openTabId
                    ? {
                        borderColor: "var(--flame)",
                        color: "var(--ink)",
                        background: "var(--flame)",
                      }
                    : tab.visible
                      ? {
                          borderColor: "var(--flame)",
                          color: "var(--flame)",
                          background: "rgba(255,179,71,0.08)",
                        }
                      : { borderColor: "var(--seam)", color: "var(--ash-dim)" }
                }
              >
                {tab.name}
              </button>
              {(tab.kind === "custom" || tab.kind === "iframe") && (
                <button
                  type="button"
                  onClick={() => {
                    removeTab(tab.id)
                    if (openTabId === tab.id) setOpenTabId(null)
                  }}
                  aria-label={t("settings.removeTabAria", { name: tab.name })}
                  className="-ml-2 flex h-5 w-5 items-center justify-center rounded-full text-xs text-[var(--ash-dim)] transition-colors hover:text-[var(--danger)]"
                >
                  ×
                </button>
              )}
            </div>
          ))}

          {!isAdding && (
            <button
              type="button"
              onClick={startAdding}
              className="rounded-full border border-dashed px-3 py-1.5 text-sm text-[var(--ash)] transition-colors hover:text-[var(--parchment)]"
              style={{ borderColor: "var(--seam)" }}
            >
              {t("settings.addCustomTab")}
            </button>
          )}
          {!isAddingIframe && (
            <button
              type="button"
              onClick={startAddingIframe}
              className="rounded-full border border-dashed px-3 py-1.5 text-sm text-[var(--ash)] transition-colors hover:text-[var(--parchment)]"
              style={{ borderColor: "var(--seam)" }}
            >
              {t("settings.addIframeTab")}
            </button>
          )}
        </div>
      </div>

      {((openTab && openTab.kind !== "iframe") || isAdding) && (
        <div className="mb-3 flex items-center justify-end gap-2">
          <span className="text-xs text-[var(--ash)]">{t("settings.allEntities")}</span>
          <Switch
            on={showAllEntities}
            onToggle={() => setShowAllEntities((v) => !v)}
            label={t("settings.allEntitiesAria")}
          />
        </div>
      )}

      {openTab && (
        <div
          className="mb-4 rounded-2xl border p-4"
          style={{ borderColor: "var(--seam)", background: "#000" }}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-medium text-[var(--parchment)]">{openTab.name}</div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--ash)]">{t("settings.showInMenu")}</span>
              <Switch
                on={openTab.visible}
                onToggle={() => setTabVisible(openTab.id, !openTab.visible)}
                label={t("settings.showInMenu")}
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="mb-1 text-xs text-[var(--ash)]">{t("settings.menuIcon")}</div>
            <IconPicker
              selectedId={getTabIcon(openTab.id)}
              onSelect={(iconId) => setTabIcon(openTab.id, iconId)}
              onReset={() => resetTabIcon(openTab.id)}
            />
          </div>

          {openTab.kind !== "iframe" && (
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="text-xs text-[var(--ash)]">{t("settings.richSummary")}</span>
              <Switch
                on={getRoomSummaryStyle(openTab.id) === "card"}
                onToggle={() =>
                  setRoomSummaryStyle(
                    openTab.id,
                    getRoomSummaryStyle(openTab.id) === "card" ? "text" : "card",
                  )
                }
                label={t("settings.richSummaryAria")}
              />
            </div>
          )}

          <div className="mb-4">
            <div className="mb-1 text-xs text-[var(--ash)]">{t("settings.menuColor")}</div>
            <ColorPicker
              activeColor={
                getTabColor(openTab.id) ??
                getRoomColor(
                  Math.max(
                    visibleTabs.findIndex((t) => t.id === openTab.id),
                    0,
                  ),
                )
              }
              hasOverride={!!getTabColor(openTab.id)}
              onSelect={(color) => setTabColor(openTab.id, color)}
              onReset={() => resetTabColor(openTab.id)}
            />
          </div>

          {openTab.kind === "custom" && (
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs text-[var(--ash)]">{t("settings.subMenus")}</span>
              <Switch
                on={!!openTab.sectioned}
                onToggle={() => setTabSectioned(openTab.id, !openTab.sectioned)}
                label={t("settings.subMenus")}
              />
            </div>
          )}

          {openTab.kind === "iframe" ? (
            <div className="mb-1">
              <label className="mb-1 block text-xs text-[var(--ash)]">{t("settings.urlLabel")}</label>
              <input
                key={`${openTab.id}-${openTab.url}`}
                type="text"
                defaultValue={openTab.url}
                onBlur={(e) => setIframeUrl(openTab.id, e.target.value.trim())}
                placeholder="http://<ha-address>:8095"
                className="mb-2 w-full rounded-lg border bg-transparent px-2.5 py-1.5 text-sm text-[var(--parchment)] outline-none"
                style={{ borderColor: "var(--seam)" }}
              />
              {iframeExamples}
              <p className="mt-2 text-xs" style={{ color: "var(--ash-dim)" }}>
                {t("settings.mixedContentWarning")}
              </p>
            </div>
          ) : openTab.kind === "custom" && openTab.sectioned ? (
            <div>
              <div className="mb-2 flex flex-wrap gap-2">
                {(openTab.sections ?? []).map((section) => (
                  <div key={section.id} className="flex items-center">
                    <button
                      type="button"
                      onClick={() => toggleSubSection(section.id)}
                      className="rounded-full border px-3 py-1.5 text-sm transition-colors"
                      style={
                        section.id === openSectionId
                          ? {
                              borderColor: "var(--flame)",
                              color: "var(--ink)",
                              background: "var(--flame)",
                            }
                          : { borderColor: "var(--seam)", color: "var(--ash)" }
                      }
                    >
                      {section.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        removeSection(openTab.id, section.id)
                        if (openSectionId === section.id) setOpenSectionId(null)
                      }}
                      aria-label={t("settings.removeTabAria", { name: section.name })}
                      className="-ml-2 flex h-5 w-5 items-center justify-center rounded-full text-xs text-[var(--ash-dim)] transition-colors hover:text-[var(--danger)]"
                    >
                      ×
                    </button>
                  </div>
                ))}

                {!isAddingSection && (
                  <button
                    type="button"
                    onClick={startAddingSection}
                    className="rounded-full border border-dashed px-3 py-1.5 text-sm text-[var(--ash)] transition-colors hover:text-[var(--parchment)]"
                    style={{ borderColor: "var(--seam)" }}
                  >
                    {t("settings.addSection")}
                  </button>
                )}
              </div>

              {isAddingSection && (
                <div
                  className="mb-3 rounded-xl border p-3"
                  style={{ borderColor: "var(--seam)" }}
                >
                  <label className="mb-1 block text-xs text-[var(--ash)]">
                    {t("settings.sectionNameLabel")}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSectionName}
                      onChange={(e) => setNewSectionName(e.target.value)}
                      placeholder={t("settings.sectionNamePlaceholder")}
                      className="flex-1 rounded-lg border bg-transparent px-2.5 py-1.5 text-sm text-[var(--parchment)] outline-none"
                      style={{ borderColor: "var(--seam)" }}
                    />
                    <button
                      type="button"
                      onClick={() => confirmAddSection(openTab.id)}
                      disabled={!newSectionName.trim()}
                      className="rounded-full px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-40"
                      style={{ background: "var(--flame)", color: "var(--ink)" }}
                    >
                      {t("common.create")}
                    </button>
                  </div>
                </div>
              )}

              {(() => {
                const section = (openTab.sections ?? []).find((s) => s.id === openSectionId)
                if (!section) return null
                return (
                  <div className="rounded-xl border p-3" style={{ borderColor: "var(--seam)" }}>
                    <div className="mb-1 text-xs text-[var(--ash)]">
                      {t("settings.cardsIncludedSection", { name: section.name })}
                    </div>
                    <CardChecklist
                      sections={sections}
                      entities={entities}
                      selected={new Set(section.cardIds)}
                      onToggle={(id) =>
                        toggleSectionCard(openTab.id, section.id, section.cardIds, id)
                      }
                    />
                  </div>
                )
              })()}
            </div>
          ) : (
            <>
              <div className="mb-1 text-xs text-[var(--ash)]">{t("settings.cardsIncluded")}</div>
              <CardChecklist
                sections={sections}
                entities={entities}
                selected={new Set(resolveTabCardIds(openTab))}
                onToggle={toggleOpenTabCard}
              />
            </>
          )}

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setOpenTabId(null)}
              className="rounded-full px-3 py-1.5 text-sm text-[var(--ash)] transition-colors hover:text-[var(--parchment)]"
            >
              {t("common.close")}
            </button>
          </div>
        </div>
      )}

      {isAddingIframe && (
        <div
          className="mb-4 rounded-2xl border p-4"
          style={{ borderColor: "var(--seam)", background: "#000" }}
        >
          <label className="mb-1 block text-xs text-[var(--ash)]">{t("settings.tabNameLabel")}</label>
          <input
            type="text"
            value={newIframeName}
            onChange={(e) => setNewIframeName(e.target.value)}
            placeholder={t("settings.iframeNamePlaceholder")}
            className="mb-4 w-full rounded-lg border bg-transparent px-3 py-2 text-sm text-[var(--parchment)] outline-none"
            style={{ borderColor: "var(--seam)" }}
          />

          <label className="mb-1 block text-xs text-[var(--ash)]">{t("settings.urlLabel")}</label>
          <input
            type="text"
            value={newIframeUrl}
            onChange={(e) => setNewIframeUrl(e.target.value)}
            placeholder="http://<ha-address>:8095"
            className="mb-2 w-full rounded-lg border bg-transparent px-3 py-2 text-sm text-[var(--parchment)] outline-none"
            style={{ borderColor: "var(--seam)" }}
          />
          {iframeExamples}
          <p className="mt-2 text-xs" style={{ color: "var(--ash-dim)" }}>
            {t("settings.mixedContentWarning")}
          </p>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddingIframe(false)}
              className="rounded-full px-3 py-1.5 text-sm text-[var(--ash)] transition-colors hover:text-[var(--parchment)]"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              onClick={confirmAddIframe}
              disabled={!newIframeName.trim()}
              className="rounded-full px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-40"
              style={{ background: "var(--flame)", color: "var(--ink)" }}
            >
              {t("settings.createTab")}
            </button>
          </div>
        </div>
      )}

      {isAdding && (
        <div
          className="rounded-2xl border p-4"
          style={{ borderColor: "var(--seam)", background: "#000" }}
        >
          <label className="mb-1 block text-xs text-[var(--ash)]">{t("settings.tabNameLabel")}</label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={t("settings.customTabNamePlaceholder")}
            className="mb-4 w-full rounded-lg border bg-transparent px-3 py-2 text-sm text-[var(--parchment)] outline-none"
            style={{ borderColor: "var(--seam)" }}
          />

          <div className="mb-1 text-xs text-[var(--ash)]">
            {t("settings.cardsToInclude")} <span className="text-[var(--ash-dim)]">{t("settings.optional")}</span>
          </div>
          <CardChecklist
            sections={sections}
            entities={entities}
            selected={newSelected}
            onToggle={toggleNewCard}
          />

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="rounded-full px-3 py-1.5 text-sm text-[var(--ash)] transition-colors hover:text-[var(--parchment)]"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              onClick={confirmAdd}
              disabled={!newName.trim()}
              className="rounded-full px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-40"
              style={{ background: "var(--flame)", color: "var(--ink)" }}
            >
              {t("settings.createTab")}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
