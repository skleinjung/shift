import { CreatureTypes } from './creature-db'
import { Objective } from './objective'

/**
 * The Campaign represents all game and player state that persists beyond a single expedition.
 */
export class Campaign {
  /** the hero's current objectives */
  private _objectives: Objective[] = []

  /** Retrieves the player's active objectives */
  public get objectives (): readonly Objective[] {
    return this._objectives
  }

  public addObjective (objective: Objective) {
    this._objectives.push(objective)
  }
}

export class DemoCampaign extends Campaign {
  constructor () {
    super()

    this.addObjective(new Objective({
      description: 'The lizards filling these caverns, while mostly harmless, are interfering with Wizardo\'s ' +
      'experiments. You are to kill "the whole bloody lot of them".',
      goal: 10,
      name: 'A Problem of Scale',
      targetType: CreatureTypes.kobold.id,
      type: 'kill',
    }))

    this.addObjective(new Objective({
      description: 'After dispatching the lizard threat, Wizardo wants you to ' +
      'find a specific blue stone somewhere nearby.',
      goal: 1,
      name: 'Strange Blue Rock',
      targetType: CreatureTypes.kobold.id,
      type: 'kill',
    }))
  }
}
