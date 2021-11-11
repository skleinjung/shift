import { MoveToAction } from 'engine/actions/move-to'
import { Creature } from 'engine/creature'
import { CellCoordinate } from 'engine/map/map'
import { creatureAdjustedCost } from 'engine/map/path-cost-functions'
import { Behavior } from 'engine/types'
import { World } from 'engine/world'

/** maximum number of attempts to pick a valid destination before a creature gives up */
const MAX_ATTEMPTS = 10

/**
 * Function that determines the current destination of a creature.
 *
 * @param creature the creature
 * @param world reference to the world data
 * @param unreachable if true, the last destination returned by this function was not pathable
 **/
export type DestinationFunction = (creature: Creature, world: World, unreachable: boolean) => CellCoordinate | undefined

/**
 * Reusable base behavior that returns actions that move a creature towards the destinations returned
 * by a DestinationFunction.
 */
export const pathFindingBehavior = (getDestination: DestinationFunction): Behavior => (creature, world) => {
  let attempt = 0
  // the next cell in the path to the destination
  let nextCell: CellCoordinate | undefined

  do {
    const destination = getDestination(creature, world, attempt !== 0)
    if (destination !== undefined) {
      const path = world.map.getPath(
        creature,
        destination,
        {
          costFunction: creatureAdjustedCost({
            adjacent: 1,
            ignore: [creature],
            map: world.map,
          }),
        }
      )

      if (path.length === 1) {
        // we are at our destination
        return undefined
      }

      if (path.length > 1) {
        if (world.map.isTraversable(path[1].x, path[1].y)) {
          nextCell = path[1]
        }
      }
    }
  } while (attempt++ < MAX_ATTEMPTS && nextCell === undefined)

  if (nextCell === undefined) {
    return undefined
  }

  return nextCell === undefined
    ? undefined
    : new MoveToAction(creature, nextCell.x, nextCell.y)
}
