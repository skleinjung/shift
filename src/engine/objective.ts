import { TypedEventEmitter } from 'typed-event-emitter'

import { CreatureTypeId } from './creature-db'
import { ObjectiveId } from './data/objective-db'
import { ObjectiveEvents } from './events'

export type ObjectiveType = 'kill'

export type ObjectiveData = Readonly<{
  /** explanatory text or summary of the objective */
  description: string

  /** total progress required to consider this objective complete */
  goal: number

  /** unique identifier for this objective */
  id: ObjectiveId

  /** human-readable title of the objective */
  name: string

  /** the type of creature that must be killed for this objective */
  targetType: CreatureTypeId

  /** type of objective (kill, collect, etc.) */
  type: ObjectiveType
}>

export class Objective extends TypedEventEmitter<ObjectiveEvents> implements ObjectiveData {
  /** unique identifier for this objective */
  public readonly id: ObjectiveId
  public readonly description: string
  public readonly goal: number
  public readonly name: string
  public readonly targetType: CreatureTypeId
  public readonly type: ObjectiveType

  private _progress: number

  constructor (objective: ObjectiveData) {
    super()

    this.id = objective.id
    this.description = objective.description
    this.goal = objective.goal
    this.name = objective.name
    this._progress = 0
    this.targetType = objective.targetType
    this.type = objective.type
  }

  /** advances the objective by one, and emits appropriate events for progress and completion */
  public advance () {
    if (!this.complete) {
      this._progress++
      this.emit('progress', this._progress, this)
    }

    if (this.complete) {
      this.emit('complete', this)
    }
  }

  /** returns true if this objective has been completed */
  public get complete (): boolean {
    return this._progress >= this.goal
  }

  /** the current progress towards the objective's goal */
  public get progress () {
    return this._progress
  }
}
