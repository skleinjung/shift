import { Item } from 'engine/item'
import { getAdjacentCoordinates } from 'engine/map/map-utils'
import { random } from 'engine/random'
import { CreatureScript, ScriptApi, WorldScript } from 'engine/script-api'
import { countBy, get, some } from 'lodash/fp'
import { distance } from 'math'

type Direction = 'up-left' | 'up' | 'up-right' | 'left' | 'right' | 'down-left' | 'down' | 'down-right' | 'none'

const SpawnChance = 10
const DefaultMinPromiximityToPlayer = 5
const DefaultMaxPromiximityToPlayer = 15

const getDirectionOfMovement = (newX: number, newY: number, oldX: number, oldY: number): Direction => {
  if (newX < oldX) {
    if (newY < oldY) {
      return 'up-left'
    } else if (newY === oldY) {
      return 'left'
    } else {
      return 'down-left'
    }
  } else if (newX === oldX) {
    if (newY < oldY) {
      return 'up'
    } else if (newY > oldY) {
      return 'down'
    }
  } else if (newX > oldX) {
    if (newY < oldY) {
      return 'up-right'
    } else if (newY === oldY) {
      return 'right'
    } else {
      return 'down-right'
    }
  }

  return 'none'
}

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
  onMove: (api, creature, { x, y, oldX, oldY }) => {
    const direction = getDirectionOfMovement(x, y, oldX, oldY)

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
  onCreate: (api, creature) => {
    const tail = new Item({
      name: 'dart lizard tail',
    })

    const tailId = api.addMapItem(tail, creature.x, creature.y + 1)
    creature.setScriptData('tailId', tailId)
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

        api.showMessage('A dart lizard wanders out of the brush!')
        api.addCreature('dart_lizard', spawnLocation.x, spawnLocation.y)
      }
    }
  },
}
