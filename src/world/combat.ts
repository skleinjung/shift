import { sample, sum, times } from 'lodash/fp'

import { Actor, Entity } from './types'

export type DieResult = 0 | 1 | 2

// Values on each face of a combat die
const DieFaces: DieResult[] = [0, 0, 1, 1, 2, 2]

export interface CombatRollResult {
  /** information on the individual dice rolled */
  dice: DieResult[]

  /** the combined score from all dice */
  total: number
}

export type AttackRollResult = CombatRollResult
export type DefenseRollResult = CombatRollResult

export const getCombatRollResult = (diceCount: number) => {
  const dice = times(() => sample(DieFaces) ?? 0, diceCount)
  return {
    dice,
    total: sum(dice),
  }
}

/**
 * Dictionary detailing why damage a defender received wasn't "dealt". The property name is a
 * string describing the effect, and the value is the amount of damage absorbed by that effect.
 *
 * Example:
 * {
 *   absorbed: 3,
 *   overkill: 2,
 *   received: 2
 * }
 *
 */
export type DamageApplication = Record<string, number> & {
  taken: number
}

export interface Attackable extends Actor {
  /** Generate a defense against the given attack */
  generateDefense: (attack: Attack) => Defense

  /**
   * Apply the effects of a completed attack action against this entity. The return value details
   * how much damage the target took, how much was resisted, etc. If null is returned, then it is
   * assumed that all of the damage was 'received'. The final AttackResult's 'damageDealt' value
   * will equal the 'received' value from the damage application.
   **/
  onHit: (attack: PendingAttack) => DamageApplication | null
}

export interface Attacker extends Entity {
  /** Generate an attack against the specified target */
  generateAttack: (target: Attackable) => Attack

  /** Optionally apply any after-attack effects, given the full result of the attack's resolution. */
  onAttackComplete?: (result: AttackResult) => void
}

/**
 * Details of an attack that is being performed.
 */
export interface Attack {
  /** result of the combat dice rolled for the attack */
  roll: AttackRollResult
}

/**
 * Details of the defense against an attack.
 */
export interface Defense {
  /** flag indicating if the defender is immune to the attack */
  immune: boolean

  /**
   * Result of the combat dice rolled for the defense. Will be undefined if the target is
   * defenseless or immune to the attack.
   **/
  roll: DefenseRollResult | undefined
}

export interface PendingAttack {
  /** attributes of the attack, such as dice rolls */
  attack: Attack

  /** the entity that generated this attack */
  attacker: Attacker

  /** amount of damage that the attack should deal to the target */
  damageRolled: number

  /** attributes of the defense, such as dice rolls */
  defense: Defense

  /** the entity targeted by this attack */
  target: Attackable
}

export interface AttackResult extends PendingAttack {
  /** detailed breakdown of the damage applied to the target */
  damage: DamageApplication

  /** the amount of damage actually taken by the target */
  damageTaken: number

  /** whether the attack was successful or not (that is, rolled damage even if unapplied) */
  success: boolean
}

export const calculateDamageRolled = (attack: Attack, defense: Defense) =>
  defense.immune
    ? 0
    : Math.max(0, attack.roll.total - (defense.roll?.total ?? 0))

export const resolveAttack = (attacker: Attacker, target: Attackable) => {
  const attack = attacker.generateAttack(target)
  const defense = target.generateDefense(attack)

  const damageRolled = calculateDamageRolled(attack, defense)

  if (damageRolled > 0) {
    const pendingAttack = {
      attack,
      attacker: attacker,
      damageRolled,
      defense,
      target,
    }

    const damageResult = target.onHit(pendingAttack)
    const damageApplication = damageResult !== null ? damageResult : {
      taken: pendingAttack.damageRolled,
    }

    const result = {
      ...pendingAttack,
      damage: damageApplication,
      damageTaken: damageApplication.taken,
      success: pendingAttack.damageRolled > 0,
    }

    attacker.onAttackComplete?.(result)
  } else {
    attacker.onAttackComplete?.({
      attack,
      attacker: attacker,
      damage: { taken: 0 },
      damageTaken: 0,
      damageRolled,
      defense,
      success: false,
      target,
    })
  }
}
