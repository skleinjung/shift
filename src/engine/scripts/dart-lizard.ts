import { CreatureEvents } from 'engine/events'
import { Item } from 'engine/item'
import { CreatureScriptFactory, ScriptApi } from 'engine/script-api'

type Direction = 'up-left' | 'up' | 'up-right' | 'left' | 'right' | 'down-left' | 'down' | 'down-right' | 'none'

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

export const dartLizard: CreatureScriptFactory = (creature) => {
  const tail = new Item({
    name: 'dart lizard tail',
  })

  // move the tail with the lizard
  const onMove = (api: ScriptApi): CreatureEvents['move'] => (_, x, y, oldX, oldY) => {
    const direction = getDirectionOfMovement(x, y, oldX, oldY)

    // the tail placement might seem backwards for the directon of movement
    // but keep in mind the idea is the tail lags _behind_ the creature
    switch (direction) {
      case 'up-left':
        api.moveMapItem(tail.id, x + 1, y + 1)
        break

      case 'up':
        api.moveMapItem(tail.id, x, y + 1)
        break

      case 'up-right':
        api.moveMapItem(tail.id, x - 1, y + 1)
        break

      case 'left':
        api.moveMapItem(tail.id, x + 1, y)
        break

      case 'right':
        api.moveMapItem(tail.id, x - 1, y)
        break

      case 'down-left':
        api.moveMapItem(tail.id, x + 1, y - 1)
        break

      case 'down':
        api.moveMapItem(tail.id, x, y - 1)
        break

      case 'down-right':
        api.moveMapItem(tail.id, x - 1, y - 1)
        break
    }
  }

  return {
    // add the lizard's tail to the map when created
    onCreate: (api) => {
      api.addMapItem(tail, creature.x, creature.y + 1)
      creature.on('move', onMove(api))
    },
  }
}
