import { Creature } from 'engine/creature'
import { random } from 'engine/random'
import { find, findIndex } from 'lodash/fp'

import { CellCoordinate, ExpeditionMap } from './map'
import { getAdjacentCoordinates } from './map-utils'

export type PathCostFunction = (from: CellCoordinate, to: CellCoordinate) => number

export const uniformCost: PathCostFunction = () => 1

const NoCreatures = [] as const

export interface CreatureAdjustedCostOptions {
  /** cost to move into a square adjacent to a creature (higher == less preferred). (default: 5) */
  adjacent?: number

  /** base cost to move into a square that isn't near a creature (higher == less preferred) (default: 1)  */
  base?: number

  /**
   * set of creatures that should be ignored in cost calculations
   * (typically, the creature the path is for); (default: none)
   **/
  ignore?: readonly Creature[]

  /** map used to locate creatures */
  map: ExpeditionMap

  /** cost to move into a square containing a creature (higher == less preferred). (default: 10) */
  occupied?: number
}

const isOccupied = (map: ExpeditionMap, { x, y }: CellCoordinate, ignore: readonly Creature[]) => {
  const creature = map.getCreature(x, y)
  return creature !== undefined && findIndex((ignored) => ignored === creature, ignore) === -1
}

/** path finding cost function that considers proximity to creatures when finding a path */
export const creatureAdjustedCost = ({
  adjacent = 10,
  base = 1,
  ignore = NoCreatures,
  map,
  occupied = 100,
}: CreatureAdjustedCostOptions): PathCostFunction => (_, to) => {
  if (isOccupied(map, to, ignore)) {
    return occupied
  }

  if (find((neighbor) => isOccupied(map, neighbor, ignore), getAdjacentCoordinates(to))) {
    return adjacent
  }

  return base
}

export const randomCosts = ({
  maximumCost = 10,
}: { maximumCost?: number } = {}): PathCostFunction => {
  const costs: Record<string, number> = {}

  return (_, to) => {
    const cellKey = `${to.x},${to.y}`
    if (costs[cellKey] === undefined) {
      costs[cellKey] = random(1, maximumCost)
    }

    return costs[cellKey]
  }
}
