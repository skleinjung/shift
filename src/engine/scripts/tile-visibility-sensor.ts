import { Creature } from 'engine/creature'
import { CreatureScript, ScriptApi } from 'engine/script-api'
import { distance } from 'math'

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

/**
 * Determines if the given creature can see the tile at (x, y), given it's current state.
 * The API is used to retrieve tile information needed for performing the calculations.
 */
export const isTileVisibleTo = (creature: Creature, x: number, y: number, _api: Pick<ScriptApi, 'getMapTile'>) => {
  const settings = creature.getScriptData<TileVisibilitySettings>(KEY_SETTINGS, false)
  const d = distance(creature.x, creature.y, x, y)
  return d <= settings.distanceLimit
}

/** sensor supporting line-of-sight calculations for tiles in a creature-aware manner */
export const tileVisibilitySensor: CreatureScript = {
  onCreate: ({ creature }) => {
    creature.setScriptData<TileVisibilitySettings>(KEY_SETTINGS, {
      distanceLimit: 12,
    })
  },
  onTurnStart: ({ creature }) => {
    creature.setScriptData(KEY_CACHE, [])
    creature.setScriptData<TileVisibilitySettings>(KEY_SETTINGS, {
      distanceLimit: 12,
    })
  },
}
