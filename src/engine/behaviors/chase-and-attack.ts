import { Creature } from 'engine/creature'
import { Behavior } from 'engine/types'

import { attack } from './attack'
import { BehaviorChain } from './behavior-chain'
import { chase } from './chase'

export interface ChaseAndAttackOptions {
  /** the target to chase and attack */
  target: Creature
}

/**
 * Behavior that will attack the specified creature, if it is in range. If not, it will attempt
 * to move closer to the creature so it gets in range.
 */
export const chaseAndAttack = ({
  target,
}: ChaseAndAttackOptions): Behavior => BehaviorChain(
  attack(target),
  chase(target)
)
