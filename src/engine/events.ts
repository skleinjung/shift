import { Speech } from './api/ui-api'
import { Objective } from './objective'

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
