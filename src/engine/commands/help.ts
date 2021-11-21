import { Command } from 'engine/types'

export const help: Command = {
  execute: (_, world) => {
    world.logMessage('This is the help command.')
  },
}
