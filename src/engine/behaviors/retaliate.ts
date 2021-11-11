import { AttackAction } from 'engine/actions/attack'
import { Behavior } from 'engine/types'

import { BehaviorChain } from './behavior-chain'
import { chase } from './chase'

export const chaseAggressor: Behavior = (creature, world) => {
  const target = creature.sensors.lastAggressor.value
  return target === undefined
    ? undefined
    : chase(target)(creature, world)
}

export const attackAggressor: Behavior = (creature) => {
  const target = creature.sensors.lastAggressor.value
  return target === undefined
    ? undefined
    : new AttackAction(creature, target)
}

export const retaliate = BehaviorChain(chaseAggressor, attackAggressor)
