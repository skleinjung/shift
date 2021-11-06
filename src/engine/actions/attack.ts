import { resolveAttack } from 'engine/combat'
import { Action, Combatant } from 'engine/types'

/** Attack another creature */
export const AttackAction = (attacker: Combatant, target: Combatant): Action => () => {
  resolveAttack(attacker, target)
}
