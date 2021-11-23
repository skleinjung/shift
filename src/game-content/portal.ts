import { MapApi } from 'engine/api/map-api'
import { TerrainTypeId, TerrainTypes } from 'engine/terrain-db'
import { ZoneId } from 'engine/zone-db'
import { join } from 'lodash/fp'

const KEY_DESTINATION = 'portal.destination'

export const createDefaultPortalDescription = (effect?: string) => {
  return join(' ', [TerrainTypes.portal.description, effect])
}

export interface CreatePortalOptions {
  /** Map API to use for interacting with map data */
  api: MapApi

  /** if set, will change the tile's description to match */
  description?: string

  /** ID of the portal's destination zone */
  destination: ZoneId

  /** if set, will change the tile's terrain type to match */
  terrain?: TerrainTypeId

  /** x-coordinate of the map tile to make a portal */
  x: number

  /** y-coordinate of the map tile to make a portal */
  y: number
}

/** Creates a portal */
export const createPortal = ({
  api,
  description,
  destination,
  terrain,
  x,
  y,
}: CreatePortalOptions) => {
  if (terrain !== undefined) {
    api.setTerrain(x, y, terrain)
  }
  if (description !== undefined) {
    api.setTileDescription(x, y, description)
  }

  const tile = api.getMapTile(x, y, true)
  tile.setScriptData(KEY_DESTINATION, destination)
}

/** Retrieves the portal destination for a map tile, or undefined if there is no portal */
export const getPortalDestination = (api: MapApi, x: number, y: number) =>
  api.getMapTile(x, y)?.getScriptData<ZoneId>(KEY_DESTINATION, true)
