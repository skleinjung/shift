import { Command } from 'engine/types'

export const help: Command = {
  execute: (_, api) => {
    api.showMessage('This is the help command.')
  },
}
