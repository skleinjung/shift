import { Creature } from 'engine/creature'
import { castRay } from 'engine/map/cast-ray'
import { TileProvider } from 'engine/map/map'
import { CreatureScript } from 'engine/script-api'
import { forEach } from 'lodash/fp'
import { distance } from 'math'

// upper limit to sight, hard-coded for now
// TODO: make this depend on creature, time of day, environment, etc.
const MaximumSightDistance = 20

// key for the cache of visibility results we've alread calculated
const KEY_CACHE = 'sensor.tile-visibility.cache'
// key for the data object controll the settings to use when calculating visibility
// this is built by our script, and is based on a combination of user configuration
// and the creature's state
const KEY_SETTINGS = 'sensor.tile-visibility.settings'

const isWithinSightRange = (creature: Creature, x: number, y: number) => {
  const settings = creature.getScriptData<TileVisibilitySettings>(KEY_SETTINGS, false)
  const d = distance(creature.x, creature.y, x, y)
  return d <= settings.distanceLimit
}

/**
 * Determines if the given creature can see the tile at (x, y), given it's current state.
 * The API is used to retrieve tile information needed for performing the calculations.
 */
export const isTileVisibleTo = (creature: Creature, x: number, y: number) => {
  if (!isWithinSightRange(creature, x, y)) {
    return false
  }

  const cache = creature.getScriptData<TileVisibilityCache>(KEY_CACHE)
  return cache.isVisible(x, y, false)
}

export class TileVisibilityCache {
  private _cache: number[][] = []

  // We have a post-processor that works by forcing some tiles to be visible even throu
  // their scores indicate they shouldn't be. The data for this is stored here.
  private _overrides: boolean[][] = []

  /**
   * Sets the visibility score as a percentage of 'fully visible' for a tile.
   **/
  public setVisibility (x: number, y: number, visibility: number) {
    if (this._cache[y] === undefined) {
      this._cache[y] = []
    }

    this._cache[y][x] = visibility
  }

  /** Used by the post-processor to correct calculations to 'look' better by overriding some cells */
  public setVisibilityOverride (x: number, y: number, visibilityOverride: boolean) {
    if (this._overrides[y] === undefined) {
      this._overrides[y] = []
    }

    this._overrides[y][x] = visibilityOverride
  }

  /**
   * Returns a boolean indicating if a tile is visible or not. If we have no data for this tile, then
   * the specified default is returned.
   **/
  public isVisible (x: number, y: number, defaultValue = false) {
    const override = this._overrides[y]?.[x]
    if (override !== undefined) {
      return override
    }

    const visibility = this._cache[y]?.[x]
    return visibility === undefined ? defaultValue : visibility > 0
  }

  /**
   * Returns true if we have data for the cell (i.e. it's visibility score has been calculated.)
   */
  public inBounds (x: number, y: number) {
    return this._cache[y]?.[x] !== undefined
  }

  /**
   * Returns the visibility score as a percentage of 'fully visible' for a tile. If we have no data for
   * this tile, the specified default is returned.
   **/
  public getVisibility (x: number, y: number, defaultValue = 0) {
    return Math.max(0, Math.min(100, this._cache[y]?.[x] ?? defaultValue))
  }
}

interface TileVisibilitySettings {
  /** the maximum distanced, in tiles, that can be seen */
  distanceLimit: number
}

/**
 * Casts a ray from the start to end point, and uses it to determine the visibility from the start point to each
 * tile along it. Will store whether tile (x, y) is visible in the result array element (result[y][x]). Uses the
 * terrain data stored in the tile provider to determine line of sight for individual tiles.
 */
const castVisibilityRay = (
  xStart: number,
  yStart: number,
  xEnd: number,
  yEnd: number,
  data: TileVisibilityCache,
  tileProvider: TileProvider
) => {
  const rayTiles = castRay(xStart, yStart, xEnd, yEnd)

  // last processed coordinates are used to determine if we are moving diagonally or not
  let percentBlocked = 0
  forEach(({ x, y }) => {
    // we can always see our start tile, and it doesn't block immediate neighbors
    if (xStart === x && yStart === y) {
      data.setVisibility(x, y, 100)
      return
    }

    data.setVisibility(x, y, Math.max(0, 100 - percentBlocked))

    // if this tile is undefined (i.e. off the map), or blocks line of sight, set the blocked flag for all tiles behind
    const tile = tileProvider.getMapTile(x, y)
    if (tile !== undefined) {
      // reduce our visbility based on the % blocking of the current tile
      percentBlocked += (tile.terrain.visibilityReduction ?? 0)
    }
  }, rayTiles)
}

const calculateRayCastVisibility = (x: number, y: number, maxRange: number, tileProvider: TileProvider) => {
  const result = new TileVisibilityCache()

  const xMin = x - maxRange
  const xMax = x + maxRange
  const yMin = y - maxRange
  const yMax = y + maxRange

  // cast rays to left and right extents of sight
  for (let row = yMin; row <= yMax; row++) {
    castVisibilityRay(x, y, xMin, row, result, tileProvider)
    castVisibilityRay(x, y, xMax, row, result, tileProvider)
  }

  // cast rays to top and bottom extents of sight
  for (let column = xMin; column <= xMax; column++) {
    castVisibilityRay(x, y, column, yMin, result, tileProvider)
    castVisibilityRay(x, y, column, yMax, result, tileProvider)
  }

  return result
}

/**
 * Post-processes raycast visibility data to fix artifacts (invisible wall sections that shouldn't be). Note that the
 * internals of this method use the terminology (wall, ground, north-west, etc.) from the source article, even though
 * they aren't used elsewhere in this game.
 *
 * @see https://sites.google.com/site/jicenospam/visibilitydetermination
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const postProcess = (
  x: number,
  y: number,
  maxRange: number,
  visibility: TileVisibilityCache,
  tileProvider: TileProvider
) => {
  const xMin = x - maxRange
  const xMax = x + maxRange
  const yMin = y - maxRange
  const yMax = y + maxRange

  /** ensures that we have data whenever checking a cell neighbor */
  const inBounds = (x: number, y: number) => {
    return visibility.inBounds(x, y)
  }

  const isHiddenWallCell = (x: number, y: number) => {
    return inBounds(x, y) &&
      visibility.getVisibility(x, y) < 1 &&
      (tileProvider.getMapTile(x, y)?.terrain?.visibilityReduction ?? 0) > 0
  }

  const isVisibleGroundCell = (x: number, y: number) => {
    return inBounds(x, y) &&
      visibility.getVisibility(x, y) > 0 &&
      (tileProvider.getMapTile(x, y)?.terrain?.visibilityReduction ?? 0) === 0
  }

  for (let row = yMin; row <= yMax; row++) {
    for (let column = xMin; column <= xMax; column++) {
      // this fix only applies to 'walls' that are NOT visible, so skip this tile if this isn't us
      if (!isHiddenWallCell(column, row)) {
        continue
      }

      // The original post-processing algorithm (which worked on boolean visibility), "unhid" walls
      // behind visibile tiles. To replicate this effect, we set the visibile of such walls to the
      // same value as the tile in front of it.
      if (column < x) {
        if (row < y) {
          // north-west region
          if (isVisibleGroundCell(column + 1, row)) {
            visibility.setVisibilityOverride(column, row, true)
          }
          if (isVisibleGroundCell(column, row + 1)) {
            visibility.setVisibilityOverride(column, row, true)
          }
        } else if (row > y) {
          // south-west region
          if (isVisibleGroundCell(column + 1, row)) {
            visibility.setVisibilityOverride(column, row, true)
          }
          if (isVisibleGroundCell(column, row - 1)) {
            visibility.setVisibilityOverride(column, row, true)
          }
        }
      } else {
        if (row < y) {
          // north-east region
          if (isVisibleGroundCell(column - 1, row)) {
            visibility.setVisibilityOverride(column, row, true)
          }
          if (isVisibleGroundCell(column, row + 1)) {
            visibility.setVisibilityOverride(column, row, true)
          }
        } else if (row > y) {
          // south-east region
          if (isVisibleGroundCell(column - 1, row)) {
            visibility.setVisibilityOverride(column, row, true)
          }
          if (isVisibleGroundCell(column, row - 1)) {
            visibility.setVisibilityOverride(column, row, true)
          }
        }
      }
    }
  }
}

/** sensor supporting line-of-sight calculations for tiles in a creature-aware manner */
export const tileVisibilitySensor: CreatureScript = {
  onCreate: ({ creature }) => {
    creature.setScriptData(KEY_CACHE, new TileVisibilityCache())
    creature.setScriptData<TileVisibilitySettings>(KEY_SETTINGS, {
      distanceLimit: MaximumSightDistance,
    })
  },
  onTurnStart: ({ creature }, api) => {
    const visibilityData = calculateRayCastVisibility(creature.x, creature.y, MaximumSightDistance, api)
    postProcess(creature.x, creature.y, MaximumSightDistance, visibilityData, api)

    creature.setScriptData(KEY_CACHE, visibilityData)
    creature.setScriptData<TileVisibilitySettings>(KEY_SETTINGS, {
      distanceLimit: MaximumSightDistance,
    })
  },
}
