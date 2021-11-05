import { sample, sum, times } from 'lodash/fp'

import { Creature } from './creature'

export type DieResult = 0 | 1 | 2

// Values on each face of a combat die
const DieFaces: DieResult[] = [0, 0, 1, 1, 2, 2]

export interface AttackResult {
  /** results for the dice rolled by the attacker */
  attackDice: DieResult[]

  /** amount of damage that the attack should deal to the target */
  damage: number

  /** results for the dice rolled by the defender */
  defenseDice: DieResult[]

  /** whether the attack was successful or not */
  success: boolean
}

/** Gets the number of attack dice a creature has when performing a melee attack */
const getMeleeAttackDice = (creature: Creature) => creature.type.melee

/** Gets the number of defence dice a creature has */
const getDefenseDice = (creature: Creature) => creature.type.defense

/**
 * Calculates the result of an attack from an attacker vs. a specified target.
 */
export const resolveAttack = (attacker: Creature, target: Creature): AttackResult => {
  const attackDice = times(() => sample(DieFaces) ?? 0, getMeleeAttackDice(attacker))
  const defenseDice = times(() => sample(DieFaces) ?? 0, getDefenseDice(target))

  const attackStrength = sum(attackDice)
  const defenseStrength = sum(defenseDice)

  return {
    attackDice,
    damage: Math.max(0, attackStrength - defenseStrength),
    defenseDice,
    success: attackStrength > defenseStrength,
  }
}
