/* eslint-disable no-console */
import { MoveToAction } from 'engine/actions/move-to'
import { Creature } from 'engine/creature'
import { CellCoordinate } from 'engine/map/map'
import { getAdjacentCoordinates } from 'engine/map/map-utils'
import { getDistanceFromHome } from 'engine/sensors/home-sensor'
import { World } from 'engine/world'
import { filter, isEmpty, sample, stubTrue } from 'lodash/fp'

import { Behavior } from '../types'

export interface MoveRandomlyOptions {
  /**
   * Optional predicate that determines whether a planned movement destination is valid for the given
   * creature or not. If unspecified, there are no movement restrictions (other than traversability).
   * This can be used to customize the types of movements a specific creature will make.
   */
  isAllowedDestination?: (x: number, y: number, creature: Creature) => boolean
}

const isValidMove = (world: World) => ({ x, y }: CellCoordinate) =>
  world.map.isTraversable(x, y)

/** Behavior that causes a creature to make a random valid move each turn, if able */
export const MoveRandomlyBehavior = ({
  isAllowedDestination = stubTrue,
}: MoveRandomlyOptions = {}): Behavior => (creature, world) => {
  const options = filter((coordinate) => {
    return isAllowedDestination(coordinate.x, coordinate.y, creature) && isValidMove(world)(coordinate)
  }, getAdjacentCoordinates(creature))

  const destination = isEmpty(options) ? undefined : sample(options)
  return destination === undefined ? undefined : new MoveToAction(creature, destination.x, destination.y)
}

/** Wandering behavior that ensures the creature never wanders more than 'maxDistance' from its home. */
export const MoveRandomlyNearHome = (maxDistance: number) => MoveRandomlyBehavior({
  isAllowedDestination: (x, y, creature) => getDistanceFromHome(creature, x, y) <= maxDistance,
})
