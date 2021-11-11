import { AttackAction } from 'engine/actions/attack'
import { Creature } from 'engine/creature'
import { areAdjacent } from 'engine/map/map-utils'
import { Behavior } from 'engine/types'

/** Behavior that initiates an attack against the player, if the player is in range */
export const attackPlayer: Behavior = (creature, world) => {
  const player = world.player
  return attack(player)(creature, world)
}

/** Behavior to attack the specified target, if they are in range. */
export const attack = (target: Creature): Behavior => (creature) => {
  if (areAdjacent(target, creature)) {
    return new AttackAction(creature, target)
  }

  return undefined
}
