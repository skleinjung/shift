import { Attack, AttackResult } from './combat'
import { Creature } from './creature'
import { Entity } from './types'

export interface WorldEvents {
  /**
   * Emitted whenever a log message with meaningful content for the player has been generated.
   **/
  message: (message: string) => void

  /**
   * Emitted after the state is updated.
   */
  update: () => void
}

/**
 * Event types emitted by Creature entities.
 *
 * TODO: most of these aren't currently emitted
 */
export interface CreatureEvents {
  /** Emitted whenever the creature performs an attack. */
  attack: (result: AttackResult, creature: Creature) => void

  /** Emitted when a creature is dealt damage. */
  damaged: (amount: number, source: Entity, creature: Creature) => void

  /** Emitted when a creature is killed */
  death: (creature: Creature) => void

  /** Emitted whenever the creature generates a defense against an attack. */
  defend: (result: Attack, creature: Creature) => void

  /** Emitted when a positionable's map location changes. */
  move: (x: number, y: number, creature: Creature) => void
}