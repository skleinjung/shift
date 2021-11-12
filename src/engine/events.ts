import { Attack, AttackResult } from './combat'
import { Creature } from './creature'
import { Objective } from './objective'
import { Entity } from './types'
import { Vignette } from './vignette'

export interface WorldEvents {
  /** Emitted when any creature is killed */
  creatureDeath: (creature: Creature) => void

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

export interface ObjectiveEvents {
  /** Emitted when the objective is completed. */
  complete: (objective: Objective) => void

  /** Emitted whenever progress is made towards an objective. */
  progress: (newValue: number, objective: Objective) => void
}

export interface VignetteEvents {
  /** emitted when the vignette advances (i.e. to new dialog, new pan action, etc.) */
  advance: (vignette: Vignette) => void

  /** Emitted when the vignette is completed and control should return to the player */
  complete: (vignette: Vignette) => void
}

export interface EngineEvents {
  /** emitted when a vignette begins */
  vignette: (vignette: Vignette) => void

  /** emitted when a vignette ends */
  vignetteComplete: (vignette: Vignette) => void
}

export interface ObjectiveTrackerEvents {
  /** emitted whenever any tracked objective has progress */
  objectiveProgress: (progress: number, objective: Objective) => void
}
