import { PALETTE } from "../lib/roomVisuals"
import { useTranslation } from "../hooks/useTranslation"

export function ColorPicker({
  activeColor,
  hasOverride,
  onSelect,
  onReset,
}: {
  activeColor: string
  hasOverride: boolean
  onSelect: (color: string) => void
  onReset: () => void
}) {
  const { t } = useTranslation()
  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {PALETTE.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onSelect(color)}
            aria-label={color}
            aria-pressed={activeColor === color}
            title={color}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-transform"
            style={{
              background: color,
              borderColor: activeColor === color ? "var(--parchment)" : "transparent",
              transform: activeColor === color ? "scale(1.1)" : undefined,
            }}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={onReset}
        disabled={!hasOverride}
        className="mt-2 text-xs text-[var(--ash)] transition-colors hover:text-[var(--parchment)] disabled:opacity-40"
      >
        {t("colorPicker.auto")}
      </button>
    </div>
  )
}
