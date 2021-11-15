type Point = { x: number; y: number }

export function distance (x1: number, y1: number, x2: number, y2: number): number
export function distance (cell1: Point, cell2: Point): number
export function distance (
  ...[cell1OrX1, cell2orY1, x2OrUndefined, y2OrUndefined]: [Point, Point] | [number, number, number, number]
): number {
  let x1 = 0
  let y1 = 0
  let x2 = 0
  let y2 = 0

  if (typeof cell1OrX1 === 'object') {
    x1 = cell1OrX1.x
    y1 = cell1OrX1.y
    x2 = (cell2orY1 as Point).x
    y2 = (cell2orY1 as Point).y
  } else {
    x1 = cell1OrX1
    y1 = cell2orY1 as number
    x2 = x2OrUndefined as number
    y2 = y2OrUndefined as number
  }

  const xPart = x2 - x1
  const yPart = y2 - y1
  return Math.sqrt((xPart * xPart) + (yPart * yPart))
}

export const manhattanDistance = (cell1: Point, cell2: Point) => {
  return Math.abs(cell2.x - cell1.x) + Math.abs(cell2.y - cell1.y)
}
