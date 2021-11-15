import { Attack, AttackResult } from './combat'
import { Creature } from './creature'
import { Objective } from './objective'
import { Speech } from './script-api'
import { Entity } from './types'

export interface WorldEvents {
  /** Emitted when any creature is killed */
  creatureDeath: (creature: Creature) => void

  /** emitted when any creature is created */
  creatureSpawn: (creature: Creature) => void

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
  move: (creature: Creature, x: number, y: number, oldX: number, oldY: number) => void
}

export interface ObjectiveEvents {
  /** Emitted when the objective is completed. */
  complete: (objective: Objective) => void

  /** Emitted whenever progress is made towards an objective. */
  progress: (newValue: number, objective: Objective) => void
}

export interface EngineEvents {
  /** emitted when a script displays speech (i.e. dialog) to the user */
  speech: (speech: Speech[]) => void
}

export interface ObjectiveTrackerEvents {
  /** emitted whenever any tracked objective has progress */
  objectiveProgress: (progress: number, objective: Objective) => void
}
