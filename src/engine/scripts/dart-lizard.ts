import { Item } from 'engine/item'
import { CreatureScript, WorldScript } from 'engine/script-api'

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

export const dartLizard: CreatureScript & WorldScript = ({
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
})
