import { useState } from "react"
import { ICON_CATALOG } from "../lib/iconCatalog"
import { useTranslation } from "../hooks/useTranslation"

export function IconPicker({
  selectedId,
  onSelect,
  onReset,
}: {
  selectedId?: string
  onSelect: (id: string) => void
  onReset: () => void
}) {
  const { t } = useTranslation()
  const [query, setQuery] = useState("")
  const q = query.trim().toLowerCase()

  const filtered = q
    ? ICON_CATALOG.filter(
        (entry) =>
          t(entry.label).toLowerCase().includes(q) ||
          entry.keywords.some((k) => k.toLowerCase().includes(q)),
      )
    : ICON_CATALOG

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("iconPicker.searchPlaceholder")}
        className="mb-2 w-full rounded-lg border bg-transparent px-2.5 py-1.5 text-sm text-[var(--parchment)] outline-none"
        style={{ borderColor: "var(--seam)" }}
      />
      <div
        className="max-h-48 overflow-y-auto rounded-lg border p-2"
        style={{ borderColor: "var(--seam)" }}
      >
        {filtered.length === 0 ? (
          <div className="px-1.5 py-2 text-xs text-[var(--ash-dim)]">{t("common.noResults")}</div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {filtered.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => onSelect(entry.id)}
                aria-label={t(entry.label)}
                aria-pressed={selectedId === entry.id}
                title={t(entry.label)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors"
                style={
                  selectedId === entry.id
                    ? {
                        borderColor: "var(--flame)",
                        color: "var(--flame)",
                        background: "rgba(255,179,71,0.08)",
                      }
                    : { borderColor: "var(--seam)", color: "var(--ash)" }
                }
              >
                <div className="h-4 w-4">
                  <entry.Icon />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onReset}
        disabled={!selectedId}
        className="mt-2 text-xs text-[var(--ash)] transition-colors hover:text-[var(--parchment)] disabled:opacity-40"
      >
        {t("iconPicker.autoIcon")}
      </button>
    </div>
  )
}
