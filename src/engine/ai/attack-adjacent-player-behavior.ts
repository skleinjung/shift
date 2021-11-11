import { AttackAction } from 'engine/actions/attack'

import { Behavior } from './behavior'

/** Behavior that initiates an attack against the player, if the player is adjacent */
export const AttackAdjacentPlayerBehavior: Behavior = (creature, world) => {
  const player = world.player

  if (creature.y === player.y && Math.abs(creature.x - player.x) < 2) {
    // on same row and no more than one tile distant
    return new AttackAction(creature, player)
  } else if (creature.x === player.x && Math.abs(creature.y - player.y) < 2) {
    // on same column and no more than one tile distant
    return new AttackAction(creature, player)
  }

  return undefined
}
