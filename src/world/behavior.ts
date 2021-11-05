import { filter, isEmpty, sample } from 'lodash/fp'

import { Action, MoveByAction, NoopAction } from './actions'
import { Creature } from './creature'
import { World } from './world'

/** A behavior is a function that generates an action for a creature during each turn. */
export type Behavior = (creature: Creature, world: World) => Action

const isValidMove = (creature: Creature, world: World) => ([x, y]: [number, number]) =>
  world.map.isTraversable(creature.x + x, creature.y + y)

/** Behavior that causes a creature to make a random valid move each turn, if able */
export const MoveRandomlyBehavior: Behavior = (creature, world) => {
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
