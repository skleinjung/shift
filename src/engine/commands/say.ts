import { Command } from 'engine/types'
import { join } from 'lodash/fp'

export const say: Command = {
  execute: (options, api) => {
    if (options.length < 1) {
      api.showMessage('What do you want to say?')
      return
    }

    api.showMessage(`You say "${join(' ', options)}".`)
  },
}
