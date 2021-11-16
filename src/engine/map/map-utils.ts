import { Positionable } from 'engine/types'
import { filter } from 'lodash/fp'

import { CellCoordinate, ExpeditionMap } from './map'

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

/**
 * HoF that uses map data to find traversable neighbors of a given cell. This function is suitable
 * to use as input to the aStar method's "getNeighbors" option.
 */
export const getTraversableNeighbors = (map: ExpeditionMap) => (cell: CellCoordinate) => {
  const possibilities = getAdjacentCoordinates(cell)
  return filter(({ x, y }) => map.getTerrain(x, y).traversable, possibilities)
}
