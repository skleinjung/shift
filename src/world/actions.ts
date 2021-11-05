import { Creature } from './creature'
import { World } from './world'

export type Action = (creature: Creature, world: World) => void

/** Do nothing this turn */
export const NoopAction = () => {
  // noop
}

/** Move the creature a specified distance in each direction. */
export const MoveByAction = (x: number, y: number): Action => (creature) => {
  creature.moveBy(x, y)
}
