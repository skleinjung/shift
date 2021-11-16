import { Creature } from './creature'
import { CreatureTypeId } from './creature-db'
import { CreatureEvents } from './events/creature-events'
import { EventHandlerName } from './events/types'
import { Item } from './item'
import { MapCell } from './map/map'
import { Objective } from './objective'

/** A single piece of content that should be displayed during a dialog 'cutscene'. */
export interface Speech {
  /** the source (i.e. speaker, etc.) of the narration or dialog */
  speaker: string

  /** the actual message (description, dialog, etc.) */
  message: string
}

export type MapTile = Readonly<Pick<MapCell,
'creature' |
'containsItem' |
'items' |
'terrain'|
'x' |
'y'
>>

export type CreatureApi = Readonly<{
  /**
   * Adds a creature to the game world at the specified coordinates. The ID of the newly added
   * creature is returned. Will fail if the space is occupied.
   */
  addCreature (type: CreatureTypeId, x: number, y: number): number
  addCreature (creature: Creature): number

  /** Read-only set of all creatures */
  creatures: readonly Creature[]

  /** Retrieves the Creature corresponding to the player. */
  player: Creature

  /**
   * Gets a random tile from the map. If tileFilter is provided, the returned tile will be one for which
   * the filter function returns true. Returns the map tile for the location that was found.
   */
  getRandomLocation (tileFilter?: (tile: MapTile) => boolean): MapTile | undefined

  /**
  * Moves the specified creature to the new (x, y) location. Will fail if the new space is occupied
  * or the creature does not exist.
  */
  moveCreature (id: number, x: number, y: number): void

  /**
  * Immediately removes the creature with the specified ID from the world. Will fail silently if there
  * is no creature with that ID.
  */
  removeCreature (id: number): void
}>

/** API exposed to scripts attached to creatures, items, etc. */
export interface ScriptApi extends CreatureApi {
  /**
   * Retrieves the map tile at the given coordinates, or undefined if it is outside the existing map.
   */
  getMapTile (x: number, y: number): MapTile | undefined

  /**
   * Puts an item in the map cell at the specified coordinates. The ID of the newly added
   * item is returned.
   */
  addMapItem (item: Item, x: number, y: number): number

  /**
   * Moves the specified item from the map cell currently containing it, to the new location. Will
   * fail if the item does not exist, or is in a container that is NOT a map cell. (i.e. this cannot
   * cause creatures to drop items.)
   */
  moveMapItem (id: number, x: number, y: number): void

  /**
   * Immediately removes the item with the specified ID from the map. Will fail silently if there
   * is no item with that ID. If the item exists, but is *not* on the ground in a map cell, this call
   * will generate a script error.
   */
  removeMapItem (id: number): void

  /**
   * Shows the specified message to the user, in the expedition log panel
   */
  showMessage (message: string): void

  /**
   * Show the supplied speech content to the user.
   * TODO: determine when it's done, so scripts can do more...
   */
  showSpeech (speech: Speech[]): void
}

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

/** interface defining the functions that can be implemented by a creature-specific script */
export type CreatureScript = {
  readonly [k in keyof CreatureEvents as EventHandlerName<k>]?: (event: CreatureEvents[k], game: ScriptApi) => void
}