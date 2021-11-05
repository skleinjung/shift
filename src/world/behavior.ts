import { filter, isEmpty, sample } from 'lodash/fp'

import { Action, AttackAction, MoveByAction, NoopAction } from './actions'
import { Creature } from './creature'
import { World } from './world'

/**
 * A behavior is a function that generates an action for a creature during each turn. If a
 * behavior returns undefined, it will be treated as a noop for the turn.
 **/
export type Behavior = (creature: Creature, world: World) => Action | undefined

const isValidMove = (creature: Creature, world: World) => ([x, y]: [number, number]) =>
  world.map.isTraversable(creature.x + x, creature.y + y)

/** Behavior that initiates an attack against the player, if the player is adjacent */
export const AttackAdjacentPlayerBehavior: Behavior = (creature, world) => {
  const player = world.player

  if (creature.y === player.y && Math.abs(creature.x - player.x) < 2) {
    // on same row and no more than one tile distant
    return AttackAction(player.id)
  } else if (creature.x === player.x && Math.abs(creature.y - player.y) < 2) {
    // on same column and no more than one tile distant
    return AttackAction(player.id)
  }

  return undefined
}

/**
 * Iterate a list of behaviors, and return the first non-undefined action provided. If all behaviors
 * return undefined, this will return undefined as well.
 */
export const CompoundBehavior = (...behaviors: Behavior[]): Behavior => (creature, world) => {
  for (const behavior of behaviors) {
    const action = behavior(creature, world)
    if (action !== undefined) {
      return action
    }
  }

  return undefined
}

/** Behavior that causes a creature to make a random valid move each turn, if able */
export const MoveRandomlyBehavior = (chanceToMove = 100): Behavior => (creature, world) => {
  if (Math.random() >= (chanceToMove / 100)) {
    return undefined
  }

  const options = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ] as [number, number][]

  const validOptions = filter(isValidMove(creature, world), options)
  const move = isEmpty(validOptions) ? undefined : sample(validOptions)
  return move === undefined ? NoopAction : MoveByAction(move[0], move[1])
}

/** Special type of behavior where actions are directly controlled by the player. */
export const PlayerBehavior: Behavior = (_, world) => world.playerAction
