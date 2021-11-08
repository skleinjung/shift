import { resolveAttack } from 'engine/combat'
import { Action, Combatant } from 'engine/types'

/** Attack another creature */
export class AttackAction implements Action {
  constructor (
    private _attacker: Combatant,
    private _target: Combatant
  ) { }

  public execute () {
    resolveAttack(this._attacker, this._target)
  }
}
