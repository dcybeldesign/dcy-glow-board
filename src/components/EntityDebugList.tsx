import { useMemo, useState } from "react"
import { useHomeAssistant } from "../hooks/useHomeAssistant"
import { useTranslation } from "../hooks/useTranslation"

export function EntityDebugList() {
  const { entities } = useHomeAssistant()
  const { t } = useTranslation()
  const [filter, setFilter] = useState("")

  const rows = useMemo(() => {
    const list = Object.values(entities)
    const needle = filter.trim().toLowerCase()
    const filtered = needle
      ? list.filter(
          (e) =>
            e.entity_id.toLowerCase().includes(needle) ||
            String(e.attributes.friendly_name ?? "")
              .toLowerCase()
              .includes(needle),
        )
      : list
    return filtered.sort((a, b) => a.entity_id.localeCompare(b.entity_id))
  }, [entities, filter])

  return (
    <div className="mx-auto w-full max-w-3xl p-6">
      <p className="mb-3 text-sm text-[var(--ash)]">
        {t("debug.entitiesReceived", { n: Object.keys(entities).length })}
      </p>
      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder={t("debug.filterPlaceholder")}
        className="mb-3 w-full rounded-lg border px-3 py-2 text-sm text-[var(--parchment)] outline-none"
        style={{ borderColor: "var(--seam)", background: "var(--ink)" }}
      />
      <div
        className="max-h-[70svh] divide-y divide-[var(--seam)] overflow-y-auto rounded-xl border"
        style={{ borderColor: "var(--seam)" }}
      >
        {rows.map((e) => (
          <div
            key={e.entity_id}
            className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
          >
            <div className="min-w-0">
              <div className="truncate text-[var(--parchment)]">
                {e.attributes.friendly_name ?? e.entity_id}
              </div>
              <div className="truncate text-xs text-[var(--ash-dim)]">
                {e.entity_id}
              </div>
            </div>
            <div className="shrink-0 font-[family-name:var(--font-mono)] text-xs text-[var(--ash)]">
              {e.state}
            </div>
          </div>
        ))}
        {rows.length === 0 && (
          <div className="px-3 py-6 text-center text-sm text-[var(--ash-dim)]">
            {t("debug.noEntities")}
          </div>
        )}
      </div>
    </div>
  )
}
