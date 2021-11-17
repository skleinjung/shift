/* eslint-disable no-console */
import { Creature } from 'engine/creature'
import { CellCoordinate } from 'engine/map/map'
import { getDetectedCreatures } from 'engine/sensors/creature-sensors'
import { Behavior } from 'engine/types'
import { World } from 'engine/world'
import { stubTrue } from 'lodash'
import { filter, findIndex, sample } from 'lodash/fp'
import { distance } from 'math'

import { chaseAndAttack } from './chase-and-attack'

/** function used to determine the location that a creature is guarding */
export type GuardedLocationFunction = (creature: Creature, world: World) => CellCoordinate

export interface GuardOptions {
  /** function that determines what a creature is guarding */
  getGuardedLocation: GuardedLocationFunction

  /**
   * Optional predicate used to determine if a creature is considered a threat or not. Any
   * creature for which 'isHostile' is false will not be attacked if they approach the guarded
   * location. By default, all creatures (other than the guard itself) are hostile.
   **/
  isHostile?: (creature: Creature, world: World) => boolean

  /** distance from the guarded location within which the creature will attack */
  radius: number
}

/**
 * Behavior that causes a creature to attack anything that comes close to a guarded location.
 * Once triggered to attack, the guarding creature will give chase and continue the offensive
 * unless the target leaves the radius. If there are no creatures within the radius, this
 * behavior does nothing. If multiple creatures are in range, the guard will focus on whichever
 * is closer. It will not pick a new target unless it's current one leaves the radius or is
 * otherwise no longer detected.
 *
 * This behavior requires the 'sensor.creatures' script data value to be populated with a list
 * of known creatures. This should be done using a suitable sensor, such as 'allCreaturesSensor'
 * or similar.
 */
export const guard = ({
  getGuardedLocation,
  isHostile = stubTrue,
  radius,
}: GuardOptions): Behavior => {
  // our current target, if any
  let currentTarget: Creature | undefined
  // the behavior causing us to attack the current target
  let attackBehavior: Behavior | undefined

  return (creature, world) => {
    const guardedLocation = getGuardedLocation(creature, world)

    // determines if another creature is too close to what we are guarding
    const isTooClose = (other: Creature) => {
      return distance(guardedLocation, other) <= radius
    }

    // potential targets include creatures we detect that are too close
    const potentialTargets = filter((other) => {
      return other !== creature && isHostile(other, world) && isTooClose(other)
    }, getDetectedCreatures(creature))

    // determine if we have a target, and it is still a valid potential target
    const isCurrentTargetValid = currentTarget !== undefined &&
      findIndex(currentTarget, potentialTargets) !== -1

    // if we don't have a valid target, try to find one
    if (!isCurrentTargetValid) {
      // for now just pick at random
      currentTarget = sample(potentialTargets)
      attackBehavior = currentTarget === undefined ? undefined : chaseAndAttack({
        target: currentTarget,
      })
    }

    return attackBehavior === undefined ? undefined : attackBehavior(creature, world)
  }
}
