import { MoveByAction } from 'engine/actions/move-by'
import { Command } from 'engine/types'
import { World } from 'engine/world'

const doMove = (byX: number, byY: number, world: World) => {
  world.player.nextAction = new MoveByAction(world.player, byX, byY)
}

export const move: Command = {
  execute: (options, world) => {
    if (options.length > 1) {
      world.logMessage('Too many arguments.')
      return
    } else if (options.length < 1) {
      world.logMessage('Move where?')
      return
    }

    switch (options[0]) {
      case 'north':
      case 'n':
        doMove(0, -1, world)
        return

      case 'south':
      case 's':
        doMove(0, 1, world)
        return

      case 'east':
      case 'e':
        doMove(1, 0, world)
        return

      case 'west':
      case 'w':
        doMove(-1, 0, world)
        return

      default:
        world.logMessage(`Unrecognized direction: ${options[0]}`)
    }
  },
}

export const createMovement = (direction: string): Command => ({
  execute: (options, world) => {
    if (options.length > 0) {
      world.logMessage('Too many arguments.')
      return
    }

    move.execute([direction], world)
  },
})

export const north = createMovement('north')
export const south = createMovement('south')
export const east = createMovement('east')
export const west = createMovement('west')
