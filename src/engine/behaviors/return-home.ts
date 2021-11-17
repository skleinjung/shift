import { getDistanceFromHome, getHome } from 'engine/sensors/home-sensor'
import { Behavior } from 'engine/types'

import { pathFindingBehavior } from './path-finding-behavior'

export interface ReturnHomeOptions {
  /** if creature is more than this distance from home, it will path back home until it's close enough */
  maxDistance: number
}

/**
 * Behavior that causes a creature to return to its home if it is currently farther away
 * than the specified distance.
 */
export const returnHome = ({
  maxDistance,
}: ReturnHomeOptions): Behavior => {
  let pathfinding: Behavior | undefined

  return (creature, world) => {
    const distance = getDistanceFromHome(creature)

    if (distance > maxDistance) {
      if (pathfinding === undefined) {
        // we've gotten too far away, head back home
        pathfinding = pathFindingBehavior(getHome)
      }
    } else {
      if (pathfinding !== undefined) {
        // we've gotten in our allowed distance again, stop pathfinding
        pathfinding = undefined
      }
    }

    // if we have a path home, follow it.. otherwise, let the next behavior take over
    return pathfinding !== undefined ? pathfinding(creature, world) : undefined
  }
}
