import { MoveToAction } from 'engine/actions/move-to'
import { CellCoordinate, MapCell } from 'engine/map/map'
import { random } from 'engine/random'
import { getStartledBy } from 'engine/sensors/startle-sensor'
import { Behavior } from 'engine/types'
import { sortBy, takeRight } from 'lodash/fp'
import { distance } from 'math'

/**
 * The 'startle' behavior causes a creature to run if it is startled.
 */
export const startle = (): Behavior => {
  // if we are startled, our flight path and index along it
  let flightPath: CellCoordinate[] | undefined
  let pathIndex = 0

  return (creature, world) => {
    const startledBy = getStartledBy(creature)

    // if we have been startled, but have no destination, find one!
    if (startledBy !== undefined && flightPath === undefined) {
      const traversable = (cell: MapCell) => cell.terrain.traversable

      // get all cells that are further away from what scared us, and traversable
      const candidateCells = world.map.getCells(traversable, {
        left: creature.x - 5,
        top: creature.y - 5,
        right: creature.x + 5,
        bottom: creature.y + 5,
      })

      // pick one of the farther cells at random, and build a path towards it
      // but ensure the path does not bring us closer to the startling creatyre
      if (candidateCells.length > 0) {
        const sortedByDistance = sortBy((cell) => distance(cell, startledBy), candidateCells)

        // randomly pick a destination from the best 1/3 of options
        const bestThird = takeRight(sortedByDistance.length / 3, sortedByDistance)
        const destination = bestThird[random(0, bestThird.length - 1)]

        flightPath = world.map.getPath(creature, destination)
        pathIndex = 1
      }
    }

    // if we have a destination, we are startled... run towards it
    if (flightPath !== undefined && flightPath.length > 1) {
      const nextCell = flightPath[pathIndex++]
      if (pathIndex >= flightPath.length) {
        flightPath = undefined
      }

      return new MoveToAction(creature, nextCell.x, nextCell.y)
    }

    // we aren't startled, so let some other behavior take over
    return undefined
  }
}
