import { CreatureEvents } from 'engine/events/creature'
import { EventHandlerName } from 'engine/events/types'
import { WorldEvents } from 'engine/events/world'

import { ScriptApi } from './script-api'

/** interface defining the functions that can be implemented by a creature-specific script */
export type CreatureScript = {
  readonly [k in keyof CreatureEvents as EventHandlerName<k>]?: (
    event: CreatureEvents[k] & { api: ScriptApi }
  ) => void | Promise<void>
}

/** Interface defining the functions that can be implemented by a Zone script */
export type WorldScript = {
  readonly [k in keyof WorldEvents as EventHandlerName<k>]?: (
    event: WorldEvents[k] & { api: ScriptApi }
  ) => void | Promise<void>
}
