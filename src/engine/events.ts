import { Attack, AttackResult } from './combat'
import { Creature } from './creature'
import { Objective } from './objective'
import { Entity } from './types'

/** A single piece of content that should be displayed during a narration 'cutscene'.1 */
export interface NarrationUnit {
  /** the source (i.e. speaker, etc.) of the narration or dialog */
  speaker: string

  /** the actual message (description, dialog, etc.) */
  message: string
}

export interface WorldEvents {
  /** Emitted when any creature is killed */
  creatureDeath: (creature: Creature) => void

  /**
   * Emitted whenever a log message with meaningful content for the player has been generated.
   **/
  message: (message: string) => void

  /**
   * Emitted when a narration cutscene is triggered. Can be observed in order to display the
   * narration to the user.
   */
  narration: (content: NarrationUnit[]) => void

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

export interface ObjectiveEvents {
  /** Emitted whenever progress is made towards an objective. */
  progress: (newValue: number, objective: Objective) => void
}
