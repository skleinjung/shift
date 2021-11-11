import { CellCoordinate } from './map'

/** returns an array of all coordinates adjacent to the supplied ones */
export const getAdjacentCoordinates = ({ x, y }: CellCoordinate) => [
  { x: x - 1, y },
  { x: x + 1, y },
  { x, y: y - 1 },
  { x, y: y + 1 },
]
