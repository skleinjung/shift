import { Objective } from 'engine/objective'

import { ScriptApi } from './script-api'

/**
 * A script is a piece of automation that can be inserted into the normal game flow, to display
 * dialog, pan the map to interesting areas, etc. The script interface exposes a number of event
 * handlers that are called by the engine whenever the relevant event occurs.
 */
export interface WorldScript {
  /** called when the script is first loaded into a new world */
  initialize?: (context: ScriptApi) => void

  onObjectiveProgress?: (progress: number, objective: Objective, context: ScriptApi) => void

  /**
   * Called once for each game turn -- that is, after each actor currently active in the game
   * has had a chance to act.
   **/
  onTurn?: (api: ScriptApi) => void
}
