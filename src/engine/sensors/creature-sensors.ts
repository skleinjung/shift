import { Creature } from 'engine/creature'
import { MapTile } from 'engine/map/map'
import { CreatureScript } from 'engine/script-api'
import { compact, filter, map } from 'lodash/fp'

import { getFacing } from './facing-sensor'

const KEY = 'sensor.creatures'

/** Uses the sensors of the specified creature to get a list of all other creatures it is aware of. */
export const getDetectedCreatures = (creature: Creature) => creature.getScriptData<Creature[]>(KEY, false)

const initialize: CreatureScript = {
  onCreate: ({ creature }) => {
    creature.setScriptData(KEY, [])
  },
}

/** 'Sensor' script that detects the presence of all other creatures in the game. */
export const allCreaturesSensor: CreatureScript = {
  ...initialize,
  onTurnStart: ({ creature }, api) => {
    // filter ourself out of the detected creature list
    creature.setScriptData(KEY, filter((other) => other.id !== creature.id, api.creatures))
  },
}

/**
 * Sensor script that detects the presence of all creatures in front of this one, within the specified distance.
 * 'In front' of is a pretty loose, triangular region. Need real field of view at some point. This sensor does
 * not account for line of sight obstructions, invisible creatures, etc.
 */
export const creaturesInFrontSensor = (distance: number): CreatureScript => ({
  ...initialize,
  onMove: ({ creature }, api) => {
    const facing = getFacing(creature)

    const getTilesFromHorizontalEdge = (distance: number, xDirection: -1 | 0 | 1): MapTile[] => {
      const result: MapTile[] = []

      for (let d = 1; d <= distance; d++) {
        const x = creature.x + (xDirection * d)
        for (let yOffset = -d * 2; yOffset <= d * 2; yOffset++) {
          const tile = api.getMapTile(x, creature.y + yOffset)
          if (tile !== undefined) {
            result.push(tile)
          }
        }
      }

      return result
    }

    const getTilesFromVerticalEdge = (distance: number, yDirection: -1 | 0 | 1): MapTile[] => {
      const result: MapTile[] = []

      for (let d = 1; d <= distance; d++) {
        const y = creature.y + (yDirection * d)
        for (let xOffset = -d * 2; xOffset <= d * 2; xOffset++) {
          const tile = api.getMapTile(creature.x + xOffset, y)
          if (tile !== undefined) {
            result.push(tile)
          }
        }
      }

      return result
    }

    const getTilesInView = () => {
      // these treats diagonal directions as if they were horizontal
      // it's fine for now, since we only support 4-axis movement
      switch (facing) {
        case 'left':
        case 'up-left':
        case 'down-left':
          return getTilesFromHorizontalEdge(distance, -1)
        case 'right':
        case 'up-right':
        case 'down-right':
          return getTilesFromHorizontalEdge(distance, 1)
        case 'up':
          return getTilesFromVerticalEdge(distance, -1)
        case 'down':
          return getTilesFromVerticalEdge(distance, 1)
      }

      return []
    }

    const tiles = getTilesInView()
    creature.setScriptData(KEY, compact(map((tile) => tile.creature, tiles)))
  },
})
