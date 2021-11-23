import { World } from 'engine/world'
import { enumerate } from 'enumerate'
import { TypedEventEmitter } from 'typed-event-emitter'

/**
 * Lifecycle and general events for the game as a whole. Life cycle is: UI ready and world ready (any order), then
 * engine ready (once those are both complete).
 **/
export type GameEvents = {
  /** Emitted when a new world has been created, when (for example) the user changes zones */
  worldChange: {
    /** reference to the new world */
    world: World
  }
}

/**
 * Array of constants that can be used to iterate over all creature events in the CreatureEvents declaration.
 * The types guarantee this is an exhaustive list.
 */
export const GameEventNames = enumerate<keyof GameEvents>()(
  'worldChange'
)

/** event emitter type for game events */
export class GameEventEmitter extends TypedEventEmitter<{
  [k in keyof GameEvents]: (event: GameEvents[k]) => void
}> {}
