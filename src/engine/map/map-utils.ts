import { Positionable } from 'engine/types'

import { CellCoordinate } from './map'

/** returns an array of all coordinates adjacent to the supplied ones */
export const getAdjacentCoordinates = ({ x, y }: CellCoordinate) => [
  { x: x - 1, y },
  { x: x + 1, y },
  { x, y: y - 1 },
  { x, y: y + 1 },
]

export const areAdjacent = (entity1: Positionable, entity2: Positionable) =>
  (entity1.y === entity2.y && Math.abs(entity1.x - entity2.x) < 2) ||
  (entity1.x === entity2.x && Math.abs(entity1.y - entity2.y) < 2)
