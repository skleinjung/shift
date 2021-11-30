import { WorldScript } from 'engine/api/script-interfaces'
import { Creature } from 'engine/creature'
import { CreatureTypes } from 'engine/creature-db'
import { Item } from 'engine/item'
import { createSanctuary } from 'game-content/map-generators/create-sanctuary'
import { createDefaultPortalDescription, createPortal } from 'game-content/portal'

export const sanctuary: WorldScript = {
  onInitialize: ({ api, world }) => {
    world.initializeFromDungeon(createSanctuary())

    createPortal({
      api,
      description: createDefaultPortalDescription('This portal will take you to the forest.'),
      destination: 'forest',
      terrain: 'portal',
      x: -3,
      y: -3,
    })

    createPortal({
      api,
      description: createDefaultPortalDescription('This portal will take you to the troll\'s lair.'),
      destination: 'troll_lair',
      terrain: 'portal',
      x: 3,
      y: -3,
    })

    api.addMapItem(new Item({ name: 'meat' }), 0, -3)

    const wizard = new Creature(CreatureTypes.human, 0, -10)
    wizard.name = 'Wizardo'
    api.addCreature(wizard)
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
