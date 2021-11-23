import { MoveByAction } from 'engine/actions/move-by'
import { ScriptApi } from 'engine/api/script-api'
import { Command } from 'engine/types'

const doMove = (byX: number, byY: number, api: ScriptApi) => {
  api.player.nextAction = new MoveByAction(api.player, byX, byY)
}

export const move: Command = {
  execute: (options, api) => {
    if (options.length > 1) {
      api.showMessage('Too many arguments.')
      return
    } else if (options.length < 1) {
      api.showMessage('Move where?')
      return
    }

    switch (options[0]) {
      case 'north':
      case 'n':
        doMove(0, -1, api)
        return

      case 'south':
      case 's':
        doMove(0, 1, api)
        return

      case 'east':
      case 'e':
        doMove(1, 0, api)
        return

      case 'west':
      case 'w':
        doMove(-1, 0, api)
        return

      default:
        api.showMessage(`Unrecognized direction: ${options[0]}`)
    }
  },
}

export const createMovement = (direction: string): Command => ({
  execute: (options, api) => {
    if (options.length > 0) {
      api.showMessage('Too many arguments.')
      return
    }

    move.execute([direction], api)
  },
})

export const north = createMovement('north')
export const south = createMovement('south')
export const east = createMovement('east')
export const west = createMovement('west')
