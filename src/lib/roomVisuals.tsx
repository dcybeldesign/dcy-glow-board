import type { ReactElement } from "react"

const ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
}

export function Bed() {
  return (
    <svg {...ICON_PROPS}>
      <rect x="3" y="11" width="18" height="7" rx="1.5" />
      <path d="M3 11V7a2 2 0 0 1 2-2h3v4" />
      <path d="M21 15v3" />
      <path d="M3 15v3" />
    </svg>
  )
}

export function CookingPot() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M4 8h16" />
      <path d="M6 8v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8" />
      <path d="M9 8V5a3 3 0 0 1 6 0v3" />
    </svg>
  )
}

export function Bath() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M7 4v4" />
      <circle cx="7" cy="4" r="1.1" />
      <path d="M4 11h16v3a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z" />
      <path d="M4 21h16" />
    </svg>
  )
}

export function Leaf() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M5 21c9-1 14-7 14-16-9 1-14 7-14 16z" />
      <path d="M5 21c3-4 6-7 9-11" />
    </svg>
  )
}

export function DoorOpen() {
  return (
    <svg {...ICON_PROPS}>
      <rect x="5" y="3" width="10" height="18" rx="1" />
      <circle cx="12" cy="12" r="1" />
      <path d="M15 3h4v18h-4" />
    </svg>
  )
}

export function Sofa() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M6 11V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3" />
      <path d="M4 13a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3H4z" />
      <path d="M5 16v3" />
      <path d="M19 16v3" />
    </svg>
  )
}

export function Archive() {
  return (
    <svg {...ICON_PROPS}>
      <rect x="3" y="4" width="18" height="5" rx="1" />
      <path d="M5 9v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9" />
      <path d="M10 13h4" />
    </svg>
  )
}

export function House() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

export function SettingsIcon() {
  return (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

const RULES: Array<[RegExp, () => ReactElement]> = [
  [/chambre|bureau/i, Bed],
  [/cuisine/i, CookingPot],
  [/bain|douche|wc|toilette/i, Bath],
  [/jardin|terrasse|balcon/i, Leaf],
  [/couloir|entr[ée]e|hall/i, DoorOpen],
  [/salon|s[ée]jour|salle a manger|salle à manger/i, Sofa],
  [/cellier|cave|garage|buanderie|grenier/i, Archive],
]

export function getRoomIcon(name: string) {
  const rule = RULES.find(([pattern]) => pattern.test(name))
  const Icon = rule ? rule[1] : House
  return <Icon />
}

export const PALETTE = [
  "#ffb347", // flame
  "#6fb7c9", // frost
  "#ff7a5c", // coral
  "#8fae7c", // moss
  "#d9a441", // amber-dim
  "#7ec8e3", // sky
  "#e08585", // rose
  "#a3c98f", // sage
  "#c9a66b", // sand
  "#8aa9c9", // slate
]

export function getRoomColor(index: number): string {
  return PALETTE[index % PALETTE.length]
}
