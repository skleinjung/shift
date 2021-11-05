import { AttackResult } from './combat'
import { Creature } from './creature'

export interface WorldEvents {
  /**
   * Emitted whenever a log message with meaningful content for the player has been generated.
   **/
  message: (message: string) => void
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
  damaged: (amount: number, creature: Creature) => void

  /** Emitted when a creature is killed */
  death: (creature: Creature) => void

  /** Emitted whenever the creature defends against an attack. */
  defend: (result: AttackResult, creature: Creature) => void

  /** Emitted when a positionable's map location changes. */
  move: (x: number, y: number, creature: Creature) => void
}
