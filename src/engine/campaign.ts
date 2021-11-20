import { dartLizard } from '../game-content/scripts/creatures/dart-lizard'
import { forestMap } from '../game-content/scripts/maps/forest-map'

import { WorldScript } from './api/world-script'
import { Objectives } from './data/objective-db'
import { createForest } from './dungeon/create-forest'
import { Dungeon } from './dungeon/dungeon'
import { Objective } from './objective'

/**
 * The Campaign represents all game and player state that persists beyond a single expedition.
 */
export class Campaign {
  /** the hero's current objectives */
  private _objectives: Objective[] = []

  /** script's active in this campaign */
  private _scripts: WorldScript[] = []

  /** Retrieves the player's active objectives */
  public get objectives (): readonly Objective[] {
    return this._objectives
  }

  public addObjective (objective: Objective) {
    this._objectives.push(objective)
  }

  public get scripts (): readonly WorldScript[] {
    return this._scripts
  }

  public addScript (script: WorldScript) {
    this._scripts.push(script)
  }

  public createNextDungeon (): Dungeon {
    return createForest()
  }
}

export class DemoCampaign extends Campaign {
  constructor () {
    super()

    this.addObjective(new Objective(Objectives.problem_of_scale))
    this.addObjective(new Objective(Objectives.strange_blue_rock))

    this.addScript(forestMap)
    this.addScript(dartLizard)
  }
}
