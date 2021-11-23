import { World } from 'engine/world'
import { enumerate } from 'enumerate'

import { EmptyEvent } from './types'

/**
 * Lifecycle events for a 'zone' in the game. (A zone is an area of the world with its own map and world
 * scripts.)
 **/
export type WorldEvents = {
  /**
   * Emitted when a zone is loaded, and the world should be initialized.
   *
   * TODO: include previous state, to be rehydrated
   **/
  initializeWorld: {
    /** world instance to initialize from this zone's data */
    world: World
  }

  /** Emitted once for each game turn, after all actors have had a chance to act */
  turn: EmptyEvent

  /** Emitted whenever the game state has updated and the UI should refresh */
  update: EmptyEvent

  /**
   * Emitted when a new world has been created or loaded, and is ready to process timer updates
   * and other events.
   */
  worldReady: {
    /** new world reference */
    world: World
  }
}

/**
 * Array of constants that can be used to iterate over all creature events in the CreatureEvents declaration.
 * The types guarantee this is an exhaustive list.
 */
export const WorldEventNames = enumerate<keyof WorldEvents>()(
  'initializeWorld',
  'turn',
  'update',
  'worldReady'
)
