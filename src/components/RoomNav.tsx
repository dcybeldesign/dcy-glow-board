import { useEffect, useRef, type ReactElement } from "react"
import { getRoomIcon, getRoomColor, SettingsIcon } from "../lib/roomVisuals"
import "./RoomNav.css"

export const SETTINGS_TAB_ID = "__settings__"
const SETTINGS_COLOR = "#a89e91"

const TAB_WIDTH = 64
const EDGE_PAD = 22
const BASE_Y = 23
const BAR_BOTTOM = 70
const CORNER_R = 24
// `.room-nav-scroll` sets overflow-x, which per spec forces overflow-y to
// `auto` too — so the bar's bottom edge, drawn flush with BAR_BOTTOM, had its
// stroke silently clipped (half of strokeWidth bled past the box with no
// room to spare). This pads the wrap/svg box below BAR_BOTTOM so the stroke
// has slack, without moving the bar shape itself.
const STROKE_BLEED = 2
const BALL_R = 17
const GAP = 4
const BALL_CY = 21
const MOAT_R = BALL_R + GAP
const FILLET_R = 3

const THETA0 = Math.atan2(
  BASE_Y - BALL_CY,
  -Math.sqrt(MOAT_R * MOAT_R - (BASE_Y - BALL_CY) ** 2),
)
const THETA_BOTTOM = Math.PI / 2

type Pt = [number, number]

function circlePt(cx: number, theta: number): Pt {
  return [cx + MOAT_R * Math.cos(theta), BALL_CY + MOAT_R * Math.sin(theta)]
}
function circleTangent(theta: number): Pt {
  return [-Math.sin(theta), Math.cos(theta)]
}
function arcBezier(cx: number, thetaA: number, thetaB: number) {
  const alpha = (4 / 3) * Math.tan((thetaB - thetaA) / 4)
  const P0 = circlePt(cx, thetaA)
  const P3 = circlePt(cx, thetaB)
  const tA = circleTangent(thetaA)
  const tB = circleTangent(thetaB)
  const C1: Pt = [P0[0] + alpha * MOAT_R * tA[0], P0[1] + alpha * MOAT_R * tA[1]]
  const C2: Pt = [P3[0] - alpha * MOAT_R * tB[0], P3[1] - alpha * MOAT_R * tB[1]]
  return { P0, C1, C2, P3 }
}
function bezierPoint(P0: Pt, C1: Pt, C2: Pt, P3: Pt, t: number): Pt {
  const mt = 1 - t
  return [
    mt ** 3 * P0[0] + 3 * mt * mt * t * C1[0] + 3 * mt * t * t * C2[0] + t ** 3 * P3[0],
    mt ** 3 * P0[1] + 3 * mt * mt * t * C1[1] + 3 * mt * t * t * C2[1] + t ** 3 * P3[1],
  ]
}
function fillet(vertex: Pt, incoming: Pt, outgoing: Pt) {
  const back: Pt = [-incoming[0], -incoming[1]]
  const dot = back[0] * outgoing[0] + back[1] * outgoing[1]
  const angle = Math.acos(Math.max(-1, Math.min(1, dot)))
  const trim = FILLET_R / Math.tan(angle / 2)
  const trimIn: Pt = [vertex[0] - incoming[0] * trim, vertex[1] - incoming[1] * trim]
  const trimOut: Pt = [vertex[0] + outgoing[0] * trim, vertex[1] + outgoing[1] * trim]
  const cross = incoming[0] * outgoing[1] - incoming[1] * outgoing[0]
  return { trimIn, trimOut, sweep: cross > 0 ? 1 : 0 }
}

function buildPath(cx: number, totalWidth: number): string {
  const left = arcBezier(cx, THETA0, THETA_BOTTOM)
  const right = arcBezier(cx, THETA_BOTTOM, Math.PI - THETA0)

  const leftOutRaw = bezierPoint(left.P0, left.C1, left.C2, left.P3, 0.001)
  const leftOut: Pt = [leftOutRaw[0] - left.P0[0], leftOutRaw[1] - left.P0[1]]
  const leftOutLen = Math.hypot(...leftOut)
  const leftOutDir: Pt = [leftOut[0] / leftOutLen, leftOut[1] / leftOutLen]
  const leftFillet = fillet(left.P0, [1, 0], leftOutDir)

  const rightNear = bezierPoint(right.P0, right.C1, right.C2, right.P3, 0.999)
  const rightIn: Pt = [right.P3[0] - rightNear[0], right.P3[1] - rightNear[1]]
  const rightInLen = Math.hypot(...rightIn)
  const rightInDir: Pt = [rightIn[0] / rightInLen, rightIn[1] / rightInLen]
  const rightFillet = fillet(right.P3, rightInDir, [1, 0])

  return [
    `M ${CORNER_R},${BASE_Y}`,
    `L ${leftFillet.trimIn}`,
    `A ${FILLET_R},${FILLET_R} 0 0 ${leftFillet.sweep} ${leftFillet.trimOut}`,
    `C ${left.C1} ${left.C2} ${left.P3}`,
    `C ${right.C1} ${right.C2} ${rightFillet.trimIn}`,
    `A ${FILLET_R},${FILLET_R} 0 0 ${rightFillet.sweep} ${rightFillet.trimOut}`,
    `L ${totalWidth - CORNER_R},${BASE_Y}`,
    `A ${CORNER_R},${CORNER_R} 0 0 1 ${totalWidth},${BASE_Y + CORNER_R}`,
    `L ${totalWidth},${BAR_BOTTOM - CORNER_R}`,
    `A ${CORNER_R},${CORNER_R} 0 0 1 ${totalWidth - CORNER_R},${BAR_BOTTOM}`,
    `L ${CORNER_R},${BAR_BOTTOM}`,
    `A ${CORNER_R},${CORNER_R} 0 0 1 0,${BAR_BOTTOM - CORNER_R}`,
    `L 0,${BASE_Y + CORNER_R}`,
    `A ${CORNER_R},${CORNER_R} 0 0 1 ${CORNER_R},${BASE_Y}`,
    "Z",
  ].join(" ")
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function navIcon(room: NavRoom) {
  if (room.icon) return room.icon
  return room.id === SETTINGS_TAB_ID ? <SettingsIcon /> : getRoomIcon(room.name)
}

export type NavRoom = { id: string; name: string; icon?: ReactElement; color?: string }

export function RoomNav({
  rooms,
  activeIndex,
  onSelect,
}: {
  rooms: NavRoom[]
  activeIndex: number
  onSelect: (index: number) => void
}) {
  const barPathRef = useRef<SVGPathElement>(null)
  const wobblerRef = useRef<HTMLDivElement>(null)
  const iconsRef = useRef<HTMLDivElement>(null)
  const pastilleRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const pastilleGlowRef = useRef<HTMLDivElement>(null)
  const activeIconRef = useRef<HTMLDivElement>(null)
  const firstRender = useRef(true)
  const cxRef = useRef(0)

  const totalWidth = rooms.length * TAB_WIDTH + EDGE_PAD * 2
  const roomsKey = rooms.map((r) => r.id).join("|")
  const activeRoom = rooms[Math.min(Math.max(activeIndex, 0), rooms.length - 1)]

  // The bar (`wrap`) is centered/scrollable inside a much wider header, so
  // the bleed-glow and the foreground active-icon overlay — which live
  // outside the scroll clip — need to be positioned from the bar's real
  // offset, not just the scroll delta.
  const syncGlowPositions = () => {
    const glow = glowRef.current
    const pastilleGlow = pastilleGlowRef.current
    const activeIcon = activeIconRef.current
    const scrollEl = scrollRef.current
    const wrap = wrapRef.current
    if (!glow || !pastilleGlow || !activeIcon || !scrollEl || !wrap) return
    const barLeft = wrap.offsetLeft - scrollEl.scrollLeft
    glow.style.left = `${barLeft}px`
    glow.style.width = `${totalWidth}px`
    pastilleGlow.style.left = `${barLeft + cxRef.current}px`
    activeIcon.style.left = `${barLeft + cxRef.current}px`
  }

  useEffect(() => {
    const n = rooms.length
    if (n === 0) return
    const index = Math.min(Math.max(activeIndex, 0), n - 1)
    const cx = EDGE_PAD + index * TAB_WIDTH + TAB_WIDTH / 2
    cxRef.current = cx
    const color =
      rooms[index].id === SETTINGS_TAB_ID
        ? SETTINGS_COLOR
        : (rooms[index].color ?? getRoomColor(index))
    const [r, g, b] = hexToRgb(color)

    const path = barPathRef.current
    const pastille = pastilleRef.current
    const wobbler = wobblerRef.current
    const icons = iconsRef.current
    const glow = glowRef.current
    const pastilleGlow = pastilleGlowRef.current
    const activeIcon = activeIconRef.current
    if (!path || !pastille || !wobbler || !icons || !glow || !pastilleGlow || !activeIcon)
      return

    const isFirst = firstRender.current
    if (isFirst) path.style.transition = "none"

    path.setAttribute("d", buildPath(cx, totalWidth))
    path.style.stroke = `rgba(${r},${g},${b},.5)`

    if (isFirst) {
      void path.getBoundingClientRect()
      path.style.transition = ""
    }

    pastille.style.left = `${cx - BALL_R}px`
    pastille.style.background = color
    // kept deliberately tight (no wide 0-0-Npx-Mpx bleed layers): this ball
    // still lives inside the clipped scroll track, so any far-reaching glow
    // belongs on `.room-nav-pastille-glow` (outside the clip) instead
    pastille.style.boxShadow = [
      "0 6px 16px -3px rgba(0,0,0,.6)",
      "inset 0 1.5px 3px rgba(255,255,255,.5)",
      `0 0 5px 1px rgba(${r},${g},${b},1)`,
    ].join(", ")

    glow.style.background = color
    pastilleGlow.style.background = color
    syncGlowPositions()

    if (!isFirst) {
      pastille.classList.remove("travelling")
      activeIcon.classList.remove("travelling")
      void pastille.offsetWidth
      pastille.classList.add("travelling")
      activeIcon.classList.add("travelling")

      wobbler.classList.remove("wobble")
      icons.classList.remove("wobble")
      void wobbler.offsetWidth
      wobbler.classList.add("wobble")
      icons.classList.add("wobble")
    }

    firstRender.current = false
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, roomsKey, totalWidth])

  useEffect(() => {
    const scrollEl = scrollRef.current
    if (!scrollEl) return
    scrollEl.addEventListener("scroll", syncGlowPositions, { passive: true })
    window.addEventListener("resize", syncGlowPositions)
    return () => {
      scrollEl.removeEventListener("scroll", syncGlowPositions)
      window.removeEventListener("resize", syncGlowPositions)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (rooms.length === 0) return null

  return (
    <div className="room-nav-outer">
      <div className="room-nav-glow" ref={glowRef} />
      <div className="room-nav-pastille-glow" ref={pastilleGlowRef} />
      <div className="room-nav-active-icon-fg" ref={activeIconRef} aria-hidden>
        {activeRoom && navIcon(activeRoom)}
      </div>
      <div className="room-nav-scroll" ref={scrollRef}>
        <div
          className="room-nav-wrap"
          ref={wrapRef}
          style={{ width: totalWidth, height: BAR_BOTTOM + STROKE_BLEED }}
        >
          <div className="room-nav-bar-wobbler" ref={wobblerRef}>
            <svg
              width={totalWidth}
              height={BAR_BOTTOM + STROKE_BLEED}
              viewBox={`0 0 ${totalWidth} ${BAR_BOTTOM + STROKE_BLEED}`}
              style={{ position: "absolute", inset: 0, overflow: "visible" }}
            >
              <path
                ref={barPathRef}
                className="room-nav-bar-path"
                style={{ fill: "var(--ember)", stroke: "var(--seam)", strokeWidth: 1.25 }}
              />
            </svg>
          </div>

          <div className="room-nav-pastille" ref={pastilleRef} />

          <div
            className="room-nav-icons"
            ref={iconsRef}
            style={{ width: totalWidth, paddingLeft: EDGE_PAD, paddingRight: EDGE_PAD }}
          >
            {rooms.map((room, i) => (
              <button
                key={room.id}
                type="button"
                className={`room-nav-tab${i === activeIndex ? " active" : ""}`}
                style={{ flex: `0 0 ${TAB_WIDTH}px` }}
                aria-label={room.name}
                aria-pressed={i === activeIndex}
                onClick={() => onSelect(i)}
              >
                {navIcon(room)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
