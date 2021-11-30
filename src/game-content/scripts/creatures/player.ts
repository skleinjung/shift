import { CreatureScript, WorldScript } from 'engine/api/script-interfaces'
import { getAdjacentCoordinates } from 'engine/map/map-utils'
import { find, get, initial, join, last, map } from 'lodash/fp'
import { getKeyMap } from 'ui/key-map'

/**
 * Scripted behavior for the creature representing the player.
 */
export const player: CreatureScript & WorldScript = {
  onMove: ({ api, x, y }) => {
    const itemNames = map(get('name'), api.getMapTile(x, y)?.items)
    if (itemNames.length > 2) {
      // list of three or more, so use commas with 'and'
      const listContents = [...initial(itemNames), `and ${last(itemNames)}`]
      api.showMessage(`You see some items here: ${join(', ', listContents)}.`)
    } else if (itemNames.length === 2) {
      // two items, just put 'and' between them
      api.showMessage(`You see ${itemNames[0]} and ${itemNames[1]} here.`)
    } else if (itemNames.length === 1) {
      api.showMessage(`You see a ${itemNames[0]} here.`)
    }

    if (itemNames.length > 0) {
      api.showMessage(`To pickup an item, press "${getKeyMap().Get}".`)
    }
  },
}

export const commandHints: CreatureScript = {
  onMove: ({ api, x, y }) => {
    if (api.getMapTile(x, y)?.terrain.id === 'portal') {
      api.showMessage(`To use a portal, press "${getKeyMap().Travel}".`)
    }

    const neighbors = getAdjacentCoordinates({ x, y })
    const wizardLocation = find(({ x, y }) => {
      return api.getMapTile(x, y)?.creature?.name === 'The Wizard'
    }, neighbors)

    if (wizardLocation !== undefined) {
      api.showMessage(`To trade with the Wizard, press "${getKeyMap().Give}".`)
    }
  },
}
