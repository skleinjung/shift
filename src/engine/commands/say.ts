import { Command } from 'engine/types'
import { join } from 'lodash/fp'

export const say: Command = {
  execute: (options, world) => {
    if (options.length < 1) {
      world.logMessage('What do you want to say?')
      return
    }

    world.logMessage(`You say "${join(' ', options)}".`)
  },
}
