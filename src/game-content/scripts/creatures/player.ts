import { CreatureScript } from 'engine/api/creature-script'
import { WorldScript } from 'engine/api/world-script'
import { Player } from 'engine/player'
import { get, initial, join, last, map } from 'lodash/fp'

export const initializePlayer: WorldScript = {
  initialize: (api) => {
    api.addCreature(new Player())
  },
}

/**
 * Scripted behavior for the creature representing the player.
 */
export const player: CreatureScript & WorldScript = {
  onMove: ({ x, y }, api) => {
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
  },
}
