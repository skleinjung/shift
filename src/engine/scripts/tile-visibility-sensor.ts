import { Creature } from 'engine/creature'
import { castRay } from 'engine/map/cast-ray'
import { TileProvider } from 'engine/map/map'
import { CreatureScript, ScriptApi } from 'engine/script-api'
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

interface TileVisibilitySettings {
  /** the maximum distanced, in tiles, that can be seen */
  distanceLimit: number
}

const isWithinSightRange = (creature: Creature, x: number, y: number) => {
  const settings = creature.getScriptData<TileVisibilitySettings>(KEY_SETTINGS, false)
  const d = distance(creature.x, creature.y, x, y)
  return d <= settings.distanceLimit
}

/**
 * Determines if the given creature can see the tile at (x, y), given it's current state.
 * The API is used to retrieve tile information needed for performing the calculations.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const isTileVisibleTo = (creature: Creature, x: number, y: number, api: Pick<ScriptApi, 'getMapTile'>) => {
  if (!isWithinSightRange(creature, x, y)) {
    return false
  }

  const cache = creature.getScriptData<boolean[][]>(KEY_CACHE)
  return cache[y]?.[x] ?? false
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
  result: boolean[][],
  tileProvider: TileProvider
) => {
  const rayTiles = castRay(xStart, yStart, xEnd, yEnd)

  let blocked = false
  forEach(({ x, y }) => {
    if (result[y] === undefined) {
      result[y] = []
    }

    // we can always see our start tile, and it doesn't block immediate neighbors
    if (xStart === x && yStart === y) {
      result[y][x] = true
      return
    }

    // if we haven't been blocked yet, it means this tile is visible (even it blocks ones behind it)
    result[y][x] = !blocked

    // if this tile is undefined (i.e. off the map), or blocks line of sight, set the blocked flag for all tiles behind
    const tile = tileProvider.getMapTile(x, y)
    if (tile !== undefined) {
      // if this is a blocking tile, block all the tiles behind it
      if (tile.terrain.blocksLineOfSight) {
        blocked = true
      }
    }
  }, rayTiles)
}

const calculateRayCastVisibility = (x: number, y: number, maxRange: number, tileProvider: TileProvider) => {
  const result: boolean[][] = []

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
const postProcess = (x: number, y: number, maxRange: number, visibility: boolean[][], tileProvider: TileProvider) => {
  const xMin = x - maxRange
  const xMax = x + maxRange
  const yMin = y - maxRange
  const yMax = y + maxRange

  /** ensures that we have data whenever checking a cell neighbor */
  const inBounds = (x: number, y: number) => {
    return visibility[y]?.[x] !== undefined
  }

  const isHiddenWallCell = (x: number, y: number) => {
    return inBounds(x, y) &&
      !visibility[y][x] &&
      tileProvider.getMapTile(x, y)?.terrain?.blocksLineOfSight === true
  }

  const isVisibleGroundCell = (x: number, y: number) => {
    return inBounds(x, y) &&
      visibility[y][x] &&
      tileProvider.getMapTile(x, y)?.terrain?.blocksLineOfSight === false
  }

  for (let row = yMin; row <= yMax; row++) {
    for (let column = xMin; column <= xMax; column++) {
      // this fix only applies to 'walls' that are NOT visible, so skip this tile if this isn't us
      if (!isHiddenWallCell(column, row)) {
        continue
      }

      if (column < x) {
        if (row < y) {
          // north-west region
          if (isVisibleGroundCell(column + 1, row) || isVisibleGroundCell(column, row + 1)) {
            visibility[row][column] = true
          }
        } else if (row > y) {
          // south-west region
          if (isVisibleGroundCell(column + 1, row) || isVisibleGroundCell(column, row - 1)) {
            visibility[row][column] = true
          }
        }
      } else {
        if (row < y) {
          // north-east region
          if (isVisibleGroundCell(column - 1, row) || isVisibleGroundCell(column, row + 1)) {
            visibility[row][column] = true
          }
        } else if (row > y) {
          // south-east region
          if (isVisibleGroundCell(column - 1, row) || isVisibleGroundCell(column, row - 1)) {
            visibility[row][column] = true
          }
        }
      }
    }
  }
}

/** sensor supporting line-of-sight calculations for tiles in a creature-aware manner */
export const tileVisibilitySensor: CreatureScript = {
  onCreate: ({ creature }) => {
    creature.setScriptData(KEY_CACHE, [])
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
