import { forEach } from 'lodash/fp'

import { Creature } from './creature'
import { Objective } from './objective'
import { World } from './world'

export class ObjectiveTracker {
  private _objectives: Objective[] = []

  constructor (
    private _world: World
  ) {
    this._world.on('creatureDeath', this._onCreatureDeath.bind(this))
  }

  public addObjective (objective: Objective) {
    this._objectives.push(objective)
  }

  private _onCreatureDeath (creature: Creature) {
    forEach((objective) => {
      if (objective.type === 'kill' && objective.targetType === creature.type.id) {
        objective.advance()
      }
    }, this._objectives)
  }
}
