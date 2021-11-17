import { Creature } from 'engine/creature'
import { castRay } from 'engine/map/cast-ray'
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
  if (cache[y]?.[x] === undefined) {
    const tilesInRay = castRay(creature.x, creature.y, x, y)

    let blocked = false
    forEach(({ x, y }) => {
      if (cache[y] === undefined) {
        cache[y] = []
      }

      // we can always see our tile, and it doesn't block immediate neighbors
      if (creature.x === x && creature.y === y) {
        cache[y][x] = true
        return
      }

      cache[y][x] = !blocked
      const tile = api.getMapTile(x, y)
      if (tile !== undefined) {
        // if this is a blocking tile, block all the tiles behind it
        if (tile.terrain.blocksLineOfSight) {
          blocked = true
        }
      }
    }, tilesInRay)
  }

  return cache[y]?.[x] ?? false
}

/** sensor supporting line-of-sight calculations for tiles in a creature-aware manner */
export const tileVisibilitySensor: CreatureScript = {
  onCreate: ({ creature }) => {
    creature.setScriptData(KEY_CACHE, [])
    creature.setScriptData<TileVisibilitySettings>(KEY_SETTINGS, {
      distanceLimit: MaximumSightDistance,
    })
  },
  onTurnStart: ({ creature }) => {
    creature.setScriptData(KEY_CACHE, [])
    creature.setScriptData<TileVisibilitySettings>(KEY_SETTINGS, {
      distanceLimit: MaximumSightDistance,
    })
  },
}
