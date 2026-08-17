import type { ReactElement } from "react"
import { AlertTriangleIcon } from "../lib/deviceIcons"
import { GlowCard } from "./GlowCard"

export type RoomStat = {
  icon: ReactElement
  value: string
  label: string
  color?: string
}

export type RoomIssue = {
  entityId: string
  name: string
  label: string
}

export function RoomSummaryCard({ stats, issues }: { stats: RoomStat[]; issues: RoomIssue[] }) {
  if (stats.length === 0 && issues.length === 0) return null

  const hasIssue = issues.length > 0

  return (
    <GlowCard active color={hasIssue ? "var(--danger)" : "var(--moss)"} intensity={hasIssue ? 0.3 : 0.14}>
      {stats.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5"
              style={{ borderColor: "var(--seam)", background: "var(--ember)" }}
            >
              <div className="h-3.5 w-3.5" style={{ color: stat.color ?? "var(--ash)" }}>
                {stat.icon}
              </div>
              <div>
                <div className="font-[family-name:var(--font-mono)] text-sm leading-none text-[var(--parchment)]">
                  {stat.value}
                </div>
                <div className="mt-0.5 text-[10px] leading-none text-[var(--ash-dim)]">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {hasIssue && (
        <div className={`flex flex-wrap justify-center gap-x-3 gap-y-1 ${stats.length > 0 ? "mt-2.5" : ""}`}>
          {issues.map((issue) => (
            <div
              key={issue.entityId}
              className="flex items-center gap-1 text-xs"
              style={{ color: "var(--danger)" }}
            >
              <div className="h-3 w-3 shrink-0">
                <AlertTriangleIcon />
              </div>
              {issue.name} · {issue.label}
            </div>
          ))}
        </div>
      )}
    </GlowCard>
  )
}
