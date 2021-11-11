import { DoNothing } from 'engine/actions/do-nothing'
import { MoveByAction } from 'engine/actions/move-by'
import { Creature } from 'engine/creature'
import { World } from 'engine/world'
import { filter, isEmpty, sample } from 'lodash/fp'

import { Behavior } from '../types'

const isValidMove = (creature: Creature, world: World) => ([x, y]: [number, number]) =>
  world.map.isTraversable(creature.x + x, creature.y + y)

/** Behavior that causes a creature to make a random valid move each turn, if able */
export const MoveRandomlyBehavior = (chanceToMove = 75): Behavior => (creature, world) => {
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
