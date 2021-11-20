import { Objective } from 'engine/objective'

import { ScriptApi } from './script-api'
import { UiApi } from './ui-api'

/**
 * A script is a piece of automation that can be inserted into the normal game flow, to display
 * dialog, pan the map to interesting areas, etc. The script interface exposes a number of event
 * handlers that are called by the engine whenever the relevant event occurs.
 */
export interface WorldScript {
  /**
   * Called when the script is first loaded into a new world. This method can load assets, create
   * data and otherwise prepare the world. However, the UI is not yet ready at this point, and so
   * no methods of the UiApi are available yet. Use onUiReady to display 'onLoad' ui elements.
   **/
  onInitialize?: (context: Omit<ScriptApi, keyof UiApi>) => void

  onObjectiveProgress?: (progress: number, objective: Objective, context: ScriptApi) => void

  /**
   * Called once for each game turn -- that is, after each actor currently active in the game
   * has had a chance to act.
   **/
  onTurn?: (api: ScriptApi) => void

  /** Called at some point after 'onInitialize', when the UI has reported that is visible and ready. */
  onUiReady?: (context: ScriptApi) => void
}
