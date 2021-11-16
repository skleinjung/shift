import { Creature } from './creature'
import { Objective } from './objective'
import { Speech } from './script-api'

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
   * Emitted after all creatures have acted in a turn.
   */
  turn: () => void

  /**
   * Emitted after the state is updated.
   */
  update: () => void
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
