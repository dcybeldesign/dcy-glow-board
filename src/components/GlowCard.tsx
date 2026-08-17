import type { ReactNode } from "react"

// Shared "lit up when active" card shell — same visual grammar as the light
// and climate cards (border + soft outer glow + a blurred corner blob),
// factored out so every genre that has an on/off or attention state can use
// it without re-deriving the stacking-context trick each time (the blob is
// `absolute` and must be followed by a `relative` sibling to paint on top).
export function GlowCard({
  active,
  color,
  intensity = 0.3,
  children,
}: {
  active: boolean
  color: string
  intensity?: number
  children: ReactNode
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border p-4 transition-all duration-500"
      style={{
        borderColor: active ? color : "rgba(255,255,255,0.09)",
        background: "#000",
        boxShadow: active
          ? `0 0 26px -6px ${color}`
          : "0 0 3px 0 rgba(0,0,0,1), 0 0 8px 2px rgba(0,0,0,0.8)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-12 h-40 w-40 rounded-full blur-2xl transition-opacity duration-700"
        style={{ background: color, opacity: active ? intensity : 0 }}
      />
      <div className="relative">{children}</div>
    </div>
  )
}
