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
 */
export interface CreatureEvents {
  /** Emitted whenever the creature performs an attack. */
  attack: (result: AttackResult) => void

  /** Emitted when a creature is killed */
  death: (creature: Creature) => void
}
