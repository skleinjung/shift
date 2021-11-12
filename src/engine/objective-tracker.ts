import { forEach } from 'lodash/fp'

import { Creature } from './creature'
import { Objective } from './objective'
import { World } from './world'

export class ObjectiveTracker {
  /** the world we are attached to */
  private _world: World | undefined
  private _objectives: Objective[] = []

  private _creatureDeathHandler = this._onCreatureDeath.bind(this)

  /** attaches this objective tracker to a world */
  public attach (world: World) {
    this.detach()

    this._world = world
    this._world.on('creatureDeath', this._creatureDeathHandler)
  }

  /** detaches this objective tracker from the world it is attached to, if any */
  public detach () {
    if (this._world !== undefined) {
      this._world.off('creatureDeath', this._creatureDeathHandler)
    }
  }

  public addObjective (objective: Objective) {
    this._objectives.push(objective)
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
