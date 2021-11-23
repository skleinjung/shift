import { forEach } from 'lodash/fp'
import { TypedEventEmitter } from 'typed-event-emitter'

import { Creature } from './creature'
import { ObjectiveTrackerEvents } from './events'
import { Objective } from './objective'
import { World } from './world'

/**
 * TODO: design of this is outdated
 * @deprecated
 */
export class ObjectiveTracker extends TypedEventEmitter<ObjectiveTrackerEvents> {
  /** the world we are attached to */
  private _world: World | undefined
  private _objectives: Objective[] = []

  private _creatureDeathHandler = this._onCreatureDeath.bind(this)
  // called when a tracked objective progress
  private _handleProgress = (progress: number, objective: Objective) => {
    this.emit('objectiveProgress', progress, objective)
  }

  /** attaches this objective tracker to a world */
  public attach (world: World) {
    this.detach()

    this._world = world
    // this._world.on('creatureDeath', this._creatureDeathHandler)
  }

  /** detaches this objective tracker from the world it is attached to, if any */
  public detach () {
    if (this._world !== undefined) {
      // this._world.off('creatureDeath', this._creatureDeathHandler)
    }
  }

  public addObjective (objective: Objective) {
    this._objectives.push(objective)
    objective.on('progress', this._handleProgress)
  }

  private _onCreatureDeath (creature: Creature) {
    forEach((objective) => {
      if (objective.type === 'kill' && objective.targetType === creature.type.id) {
        if (!objective.complete) {
          objective.advance()
        }
      }
    }, this._objectives)
  }
}
