import { Engine } from 'engine/engine'
import { enumerate } from 'enumerate'

/**
 * Lifecycle and general events for the game as a whole. Life cycle is: UI ready and world ready (any order), then
 * engine ready (once those are both complete).
 **/
export type GameEvents = {
  /** Emitted when the engine is ready (world is initialized, ui is ready, and the game loop has started.) */
  engineReady: {
    engine: Engine
  }
}

/**
 * Array of constants that can be used to iterate over all creature events in the CreatureEvents declaration.
 * The types guarantee this is an exhaustive list.
 */
export const GameEventNames = enumerate<keyof GameEvents>()(
  'engineReady'
)
