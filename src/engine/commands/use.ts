import { Command } from 'engine/types'
import { getPortalDestination } from 'game-content/portal'

export const use: Command = {
  execute: (options, api) => {
    if (options.length < 1) {
      api.showMessage('Use what?')
      return
    }

    if (options.length === 1 && options[0] === 'portal') {
      const destination = getPortalDestination(api, api.player.x, api.player.y)
      if (destination === undefined) {
        api.showMessage('There is no portal here.')
      } else {
        api.loadZone(destination)
      }
    } else {
      api.showMessage('You don\'t know how to use that.')
    }
  },
}
