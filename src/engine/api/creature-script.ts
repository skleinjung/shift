import { CreatureEvents } from 'engine/events/creature'
import { EventHandlerName } from 'engine/events/types'

import { ScriptApi } from './script-api'

/** interface defining the functions that can be implemented by a creature-specific script */
export type CreatureScript = {
  readonly [k in keyof CreatureEvents as EventHandlerName<k>]?: (event: CreatureEvents[k], game: ScriptApi) => void
}
