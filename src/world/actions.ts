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
export const AttackAction = (targetId: Creature['id']): Action => (creature, world) => {
  const target = world.creatures[targetId]
  if (target !== undefined) {
    const result = resolveAttack(creature, target)
    if (result.success) {
      target.takeDamage(result.damage)
      world.logMessage(`${creature.type.name} hits ${target.type.name} for ${result.damage} damage.`)
    } else {
      world.logMessage(`${creature.type.name} misses ${target.type.name}.`)
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
