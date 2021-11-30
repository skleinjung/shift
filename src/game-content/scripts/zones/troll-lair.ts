import { CreatureScript, WorldScript } from 'engine/api/script-interfaces'
import { Creature } from 'engine/creature'
import { CreatureTypes } from 'engine/creature-db'
import { Item } from 'engine/item'
import { random } from 'engine/random'
import { createTrollLair } from 'game-content/map-generators/create-troll-lair'
import { createDefaultPortalDescription, createPortal } from 'game-content/portal'
import { findIndex } from 'lodash/fp'

import { createTrollBloodSplatter, TROLL_BLOOD_SPLATTER_NAME } from '../items/troll-blood'

/**
 * Creature script that (conditionally) creates an item from a template in the attacker's inventory
 * whenever the creature that owns this script is damaged. Will only create the item if the 'shouldCreate'
 * predicate returns true. (Which it always does by default.)
 */
export const createBloodSplatterWhenDamaged: CreatureScript = {
  onDamaged: ({ api, source }) => {
    if (source instanceof Creature) {
      const alreadySplattered = findIndex((item) => {
        return item.name === TROLL_BLOOD_SPLATTER_NAME
      }, source.inventory.items) !== -1

      if (!alreadySplattered) {
        const blood = createTrollBloodSplatter()
        blood.droppable = false

        source.inventory.addItem(blood)
        api.showSpeech([
          {
            message: `As you wound the troll, you are splattered with enough of it's blood for the wizard's potion. 
You should bring it to him quickly, while it's still fresh.`,
            speaker: 'Narrator',
          },
        ])
      }
    }
  },
}

export const trollLair: WorldScript = {
  onInitialize: ({ api, world }) => {
    const dungeon = createTrollLair()
    world.initializeFromDungeon(dungeon)

    const rooms = dungeon.rooms
    const trollRoom = rooms[rooms.length - 1]
    const troll = new Creature(
      CreatureTypes.troll,
      random(trollRoom.left, trollRoom.right),
      random(trollRoom.top, trollRoom.bottom)
    )
    troll.addScript(createBloodSplatterWhenDamaged)
    api.addCreature(troll)

    createPortal({
      api,
      description: createDefaultPortalDescription('This portal will return you to the sanctuary.'),
      destination: 'sanctuary',
      terrain: 'portal',
      x: 0,
      y: 0,
    })
  },
//   onReady: async ({ api }) => {
//     await api.showSpeech([
//       {
//         message: `The winding path from the village opens into a large clearing filled with ice-blue flowers.
//               The sickly-sweet smell of decaying fall leaves is thick in the air here.`,
//       },
//       {
//         message: `The clearing itself is quiet,      but you can hear the sound
// of running water somewhere off to the north.`,
//       },
//     ])
//   },
}
