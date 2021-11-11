import { filter, isEmpty, sample } from 'lodash/fp'

import { AttackAction } from '../actions/attack'
import { DoNothing } from '../actions/do-nothing'
import { MoveByAction } from '../actions/move-by'
import { Creature } from '../creature'
import { Player } from '../player'
import { Action } from '../types'
import { World } from '../world'

import { creatureAdjustedCost } from './path-cost-functions'

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
    return new AttackAction(creature, player)
  } else if (creature.x === player.x && Math.abs(creature.y - player.y) < 2) {
    // on same column and no more than one tile distant
    return new AttackAction(creature, player)
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
  return move === undefined ? DoNothing : new MoveByAction(creature, move[0], move[1])
}

/** Special type of behavior where actions are directly controlled by the player. */
export const PlayerBehavior = (player: Player): Behavior => (_, world) => {
  // player is auto-moving?
  if (player.destination !== undefined) {
    const path = world.map.getPath(
      player,
      player.destination,
      { costFunction: creatureAdjustedCost({ ignore: [player], map: world.map }) }
    )

    // if we have a path that consists of more than the start node, move to the next node
    if (path.length > 1) {
      const nextStep = path[1]

      if (world.map.isTraversable(nextStep.x, nextStep.y)) {
        const xDelta = path[1].x - player.x
        const yDelta = path[1].y - player.y

        if (xDelta !== 0 || yDelta !== 0) {
          return new MoveByAction(player, xDelta, yDelta)
        }
      } else {
        world.logMessage('Your path is blocked.')
        player.destination = undefined
        return undefined
      }
    } else {
      // we are finished moving -or- there was no path, return to manual input mode
      player.destination = undefined
    }
  }

  // execute the action set by the player via the UI
  const action = player.nextAction
  player.nextAction = undefined
  return action
}
