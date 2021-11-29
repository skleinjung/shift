import { WorldScript } from 'engine/api/script-interfaces'
import { Creature } from 'engine/creature'
import { CreatureTypes } from 'engine/creature-db'
import { random } from 'engine/random'
import { createTrollLair } from 'game-content/map-generators/create-troll-lair'
import { createDefaultPortalDescription, createPortal } from 'game-content/portal'

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
