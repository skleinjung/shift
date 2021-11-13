import { Objectives } from './data/objective-db'
import { createDungeon } from './dungeon/create-dungeon-v1'
import { Script } from './engine'
import { Objective } from './objective'
import { ProblemOfScale } from './scripts/problem-of-scale'
import { World } from './world'

/**
 * The Campaign represents all game and player state that persists beyond a single expedition.
 */
export class Campaign {
  /** the hero's current objectives */
  private _objectives: Objective[] = []

  /** script's active in this campaign */
  private _scripts: Script[] = []

  /** Retrieves the player's active objectives */
  public get objectives (): readonly Objective[] {
    return this._objectives
  }

  public addObjective (objective: Objective) {
    this._objectives.push(objective)
  }

  public get scripts (): readonly Script[] {
    return this._scripts
  }

  public addScript (script: Script) {
    this._scripts.push(script)
  }

  public createNextWorld (): World {
    const dungeon = createDungeon()
    return new World(dungeon)
  }
}

export class DemoCampaign extends Campaign {
  constructor () {
    super()

    this.addObjective(new Objective(Objectives.problem_of_scale))
    this.addObjective(new Objective(Objectives.strange_blue_rock))

    this.addScript(ProblemOfScale)
  }
}
