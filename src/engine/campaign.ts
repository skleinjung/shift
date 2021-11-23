import { Objectives } from './data/objective-db'
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

    this.addObjective(new Objective(Objectives.problem_of_scale))
    this.addObjective(new Objective(Objectives.strange_blue_rock))
  }
}
