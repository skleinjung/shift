import { Creature } from './creature'
import { CreatureTypeId } from './creature-db'
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

export interface CreatureApi {
  /**
   * Adds a creature to the game world at the specified coordinates. The ID of the newly added
   * creature is returned. Will fail if the space is occupied.
   */
  addCreature (type: CreatureTypeId, x: number, y: number): number
  addCreature (creature: Creature): number

  /** Read-only set of all creatures */
  creatures: readonly Creature[]

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
}

/** API exposed to scripts attached to creatures, items, etc. */
export interface ScriptApi extends CreatureApi {
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

  /** called for each game update performed by the main loop */
  onUpdate?: (api: ScriptApi) => void
}

/** interface defining the functions that can be implemented by a creature-specific script */
export interface CreatureScript {
  /** called when a creature is first created and associated with the script */
  onCreate?: (context: ScriptApi, creature: Creature) => void

  /** called when the creature moves */
  onMove?: (context: ScriptApi, creature: Creature, event: { x: number; y: number; oldX: number; oldY: number }) => void
}
