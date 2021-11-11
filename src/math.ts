type Point = { x: number; y: number }

export const distance = (cell1: Point, cell2: Point) => {
  const xPart = cell2.x - cell1.x
  const yPart = cell2.y - cell1.y
  return Math.sqrt((xPart * xPart) + (yPart * yPart))
}

export const manhattanDistance = (cell1: Point, cell2: Point) => {
  return Math.abs(cell2.x - cell1.x) + Math.abs(cell2.y - cell1.y)
}
