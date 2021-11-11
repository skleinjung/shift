import { Behavior } from 'engine/types'

import { attack } from './attack'
import { BehaviorChain } from './behavior-chain'
import { chase } from './chase'

export const chaseAggressor: Behavior = (creature, world) => {
  const target = creature.sensors.lastAggressor.value
  return target === undefined
    ? undefined
    : chase(target)(creature, world)
}

export const attackAggressor: Behavior = (creature, world) => {
  const target = creature.sensors.lastAggressor.value
  return target === undefined
    ? undefined
    : attack(target)(creature, world)
}

export const retaliate = BehaviorChain(attackAggressor, chaseAggressor)
