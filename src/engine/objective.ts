import { TypedEventEmitter } from 'typed-event-emitter'

import { CreatureTypeId } from './creature-db'
import { ObjectiveEvents } from './events'

export type ObjectiveType = 'kill'

export interface ObjectiveData {
  /** explanatory text or summary of the objective */
  description: string

  /** total progress required to consider this objective complete */
  goal: number

  /** human-readable title of the objective */
  name: string

  /** the type of creature that must be killed for this objective */
  targetType: CreatureTypeId

  /** type of objective (kill, collect, etc.) */
  type: ObjectiveType
}

export class Objective extends TypedEventEmitter<ObjectiveEvents> implements ObjectiveData {
  public readonly description: string
  public readonly goal: number
  public readonly name: string
  public readonly targetType: CreatureTypeId
  public readonly type: ObjectiveType

  private _progress: number

  constructor (objective: ObjectiveData) {
    super()

    this.description = objective.description
    this.goal = objective.goal
    this.name = objective.name
    this._progress = 0
    this.targetType = objective.targetType
    this.type = objective.type
  }

  /** advances the objective by one */
  public advance () {
    this._progress++
    this.emit('progress', this._progress, this)
  }

  public get progress () {
    return this._progress
  }
}
