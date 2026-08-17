import type { CardLayout } from "./dashboardConfig"

// Fixed for now — variable-width / responsive columns can come later.
export const GRID_COLUMNS = 3

export type GridCell = { id: string; row: number; col: number; colSpan: number }

function clampSpan(span: number): number {
  return Math.min(GRID_COLUMNS, Math.max(1, Math.round(span) || 1))
}

export function resolveGridPositions(
  entityIds: string[],
  layout: CardLayout | undefined,
  getColSpan: (id: string) => number,
): GridCell[] {
  const occupied = new Set<string>()
  const placed = new Set<string>()
  const positions: GridCell[] = []
  let maxRow = -1

  if (layout) {
    for (const id of entityIds) {
      const pos = layout[id]
      const colSpan = clampSpan(getColSpan(id))
      if (
        pos &&
        Number.isInteger(pos.row) &&
        pos.row >= 0 &&
        Number.isInteger(pos.col) &&
        pos.col >= 0 &&
        pos.col + colSpan <= GRID_COLUMNS
      ) {
        const keys = Array.from({ length: colSpan }, (_, i) => `${pos.row}-${pos.col + i}`)
        if (keys.every((k) => !occupied.has(k))) {
          positions.push({ id, row: pos.row, col: pos.col, colSpan })
          keys.forEach((k) => occupied.add(k))
          placed.add(id)
          maxRow = Math.max(maxRow, pos.row)
        }
      }
    }
  }

  let row = maxRow + 1
  let col = 0
  for (const id of entityIds) {
    if (placed.has(id)) continue
    const colSpan = clampSpan(getColSpan(id))
    if (col + colSpan > GRID_COLUMNS) {
      col = 0
      row++
    }
    positions.push({ id, row, col, colSpan })
    col += colSpan
    if (col >= GRID_COLUMNS) {
      col = 0
      row++
    }
  }

  return positions
}

export function maxUsedRow(cells: GridCell[]): number {
  return cells.reduce((max, c) => Math.max(max, c.row), -1)
}

export function emptyCells(cells: GridCell[]): { row: number; col: number }[] {
  const occupied = new Set<string>()
  for (const c of cells) {
    for (let i = 0; i < c.colSpan; i++) occupied.add(`${c.row}-${c.col + i}`)
  }
  const lastRow = maxUsedRow(cells) + 1
  const empties: { row: number; col: number }[] = []
  for (let row = 0; row <= lastRow; row++) {
    for (let col = 0; col < GRID_COLUMNS; col++) {
      if (!occupied.has(`${row}-${col}`)) empties.push({ row, col })
    }
  }
  return empties
}

export function snapshotLayout(cells: GridCell[]): CardLayout {
  const layout: CardLayout = {}
  for (const c of cells) layout[c.id] = { row: c.row, col: c.col }
  return layout
}
