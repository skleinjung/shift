import { resolveAttack } from './combat'
import { Creature } from './creature'
import { World } from './world'

export type Action = (creature: Creature, world: World) => void

/** Do nothing this turn */
export const NoopAction: Action = () => {
  // noop
}

/** Attack another creature */
export const AttackAction = (targetId: Creature['id']): Action => (creature, world) => {
  const target = world.creatures[targetId]
  if (target !== undefined) {
    const result = resolveAttack(creature, target)
    if (result.success) {
      target.takeDamage(result.damage)
    }
  } else {
    // eslint-disable-next-line no-console
    console.warn(`Invalid target creature ID: ${targetId}`)
  }
}

/** Move the creature a specified distance in each direction. */
export const MoveByAction = (x: number, y: number): Action => (creature) => {
  creature.moveBy(x, y)
}
