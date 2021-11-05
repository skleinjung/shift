import { resolveAttack } from './combat'
import { Creature } from './creature'
import { World } from './world'

/**
 * An action taken by a creature during a turn. Will be passed the acting creature, and an instance of
 * the world.
 */
export type Action = (creature: Creature, world: World) => void

/** Do nothing this turn */
export const NoopAction: Action = () => {
  // noop
}

/** Attack another creature */
export const AttackAction = (target: Creature): Action => (creature) => {
  resolveAttack(creature, target)
}

/** Move the creature a specified distance in each direction. */
export const MoveByAction = (x: number, y: number): Action => (creature) => {
  creature.moveBy(x, y)
}
