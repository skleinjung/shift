import { Item } from 'engine/item'
import { MapTile, TileProvider } from 'engine/map/map'
import { TerrainTypeId } from 'engine/terrain-db'

export type MapApi = Readonly<TileProvider & {
  /**
   * Puts an item in the map cell at the specified coordinates. The ID of the newly added
   * item is returned.
   */
  addMapItem (item: Item, x: number, y: number): number

  /**
   * Gets a random tile from the map. If tileFilter is provided, the returned tile will be one for which
   * the filter function returns true. Returns the map tile for the location that was found.
   */
  getRandomLocation (tileFilter?: (tile: MapTile) => boolean): MapTile | undefined

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

  /** Updates the map data by setting the terrain at a specified location. */
  setTerrain: (x: number, y: number, terrain: TerrainTypeId) => void
}>
