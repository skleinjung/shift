import { Item } from 'engine/item'
import { getAdjacentCoordinates } from 'engine/map/map-utils'
import { random } from 'engine/random'
import { CreatureScript, ScriptApi, WorldScript } from 'engine/script-api'
import { countBy, get, join, map, some } from 'lodash/fp'
import { distance } from 'math'

import { getAge } from './age-sensor'
import { getDetectedCreatures } from './creature-sensors'
import { getFacing } from './facing-sensor'

const DisappearChance = 10
const SpawnChance = 3
// minimum number of turns a lizard must stay on the map before darting away
const MinimumAgeBeforeDisappearing = 7

const DefaultMinPromiximityToPlayer = 5
const DefaultMaxPromiximityToPlayer = 13

/**
 * Returns true if the specified coordinates are within 'minDistance' and 'maxDistance' (inclusive) tiles
 * of the player.
 **/
const nearPlayer = (
  api: ScriptApi,
  x: number,
  y: number,
  minDistance = DefaultMinPromiximityToPlayer,
  maxDistance = DefaultMaxPromiximityToPlayer
): boolean => {
  const player = api.player
  const distanceToPlayer = distance(x, y, player.x, player.y)

  return distanceToPlayer >= minDistance && distanceToPlayer <= maxDistance
}

/** Returns true if the specified coordinates are adjacent to heavy brush terrain */
const nextToHeavyBrush = (api: ScriptApi, x: number, y: number): boolean => {
  const neighbors = getAdjacentCoordinates({ x, y })
  return some(
    (neighbor) => api.getMapTile(neighbor.x, neighbor.y)?.terrain.id === 'heavy_brush',
    neighbors
  )
}

export const dartLizard: CreatureScript & WorldScript = {
  // move the tail with the lizard
  onMove: ({ creature, x, y }, api) => {
    const direction = getFacing(creature)

    const tailId = creature.getScriptData<number>('tailId')

    // the tail placement might seem backwards for the directon of movement
    // but keep in mind the idea is the tail lags _behind_ the creature
    switch (direction) {
      case 'up-left':
        api.moveMapItem(tailId, x + 1, y + 1)
        break

      case 'up':
        api.moveMapItem(tailId, x, y + 1)
        break

      case 'up-right':
        api.moveMapItem(tailId, x - 1, y + 1)
        break

      case 'left':
        api.moveMapItem(tailId, x + 1, y)
        break

      case 'right':
        api.moveMapItem(tailId, x - 1, y)
        break

      case 'down-left':
        api.moveMapItem(tailId, x + 1, y - 1)
        break

      case 'down':
        api.moveMapItem(tailId, x, y - 1)
        break

      case 'down-right':
        api.moveMapItem(tailId, x - 1, y - 1)
        break
    }
  },
  // add the lizard's tail to the map when a lizard created
  onCreate: ({ creature }, api) => {
    const tail = new Item({
      name: 'dart lizard tail',
    })

    const tailId = api.addMapItem(tail, creature.x, creature.y + 1)
    creature.setScriptData('tailId', tailId)
  },
  onDeath: ({ creature }, api) => {
    const tailId = creature.getScriptData<number>('tailId')
    api.removeMapItem(tailId)
    creature.setScriptData('tailId', undefined)
  },
  onTurn: (api) => {
    const countsByTypeId = countBy(get(['type', 'id']), api.creatures)
    if ((countsByTypeId.dart_lizard ?? 0) < 5) {
      if (random(0, 99) < SpawnChance) {
        const spawnLocation = api.getRandomLocation((tile) => {
          return tile.terrain.traversable &&
            nextToHeavyBrush(api, tile.x, tile.y) &&
            nearPlayer(api, tile.x, tile.y)
        })

        if (spawnLocation === undefined) {
          throw new Error('No valid spawn locations found.')
        }

        api.showMessage('A dart lizard wanders out of the brush.')
        api.addCreature('dart_lizard', spawnLocation.x, spawnLocation.y)
      }
    }
  },
  onTurnStart: ({ creature }, api) => {
    const creatures = getDetectedCreatures(creature)
    if (creatures.length > 0) {
      api.showMessage(`Lizard will run because of: ${join(', ', map(get('name'), creatures))}`)
    }
  },
  onTurnEnd: ({ creature }, api) => {
    // after a few turns, each turn a lizard is near heavy brush, there is a chance they dash into it
    if (getAge(creature) > MinimumAgeBeforeDisappearing && random(0, 99) < DisappearChance) {
      if (nextToHeavyBrush(api, creature.x, creature.y)) {
        api.showMessage('A dart lizard dashes into the brush!')
        api.removeCreature(creature.id)

        const tailId = creature.getScriptData<number>('tailId')
        api.removeMapItem(tailId)
      }
    }
  },
}
