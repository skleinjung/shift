import { CreatureScript } from 'engine/api/script-interfaces'
import { Creature } from 'engine/creature'

const KEY = 'sensor.facing'

export type Direction = 'up-left' | 'up' | 'up-right' | 'left' | 'right' | 'down-left' | 'down' | 'down-right' | 'none'

/** Uses the facing sensor to get the direction the creature is facing, based on it's last movement. */
export const getFacing = (creature: Creature) => creature.getScriptData<Direction>(KEY, false)

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

/** Sensor that determines which direction a creature is looking. */
export const facingSensor: CreatureScript = {
  onCreate: ({ creature }) => {
    // just start with an arbitrary direction
    creature.setScriptData(KEY, 'up')
  },
  onMove: ({ creature, x, y, xOld, yOld }) => {
    const direction = getDirectionOfMovement(x, y, xOld, yOld)
    creature.setScriptData(KEY, direction)
  },
}
