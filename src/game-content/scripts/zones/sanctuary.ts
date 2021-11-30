import { WorldScript } from 'engine/api/script-interfaces'
import { Creature } from 'engine/creature'
import { CreatureTypes } from 'engine/creature-db'
import { Item } from 'engine/item'
import { createSanctuary } from 'game-content/map-generators/create-sanctuary'
import { createDefaultPortalDescription, createPortal } from 'game-content/portal'
import { wizard as wizardScript } from 'game-content/scripts/creatures/wizard'

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
    wizard.addScript(wizardScript)
    api.addCreature(wizard)
  },
  onReady: async ({ api }) => {
    if (api.getTimesVisited('sanctuary') === 1) {
      await api.showSpeech([
        {
          message: `Just as you begin to read the instructions he gave you, 
the wizard calls out some final words of advice.`,
          speaker: 'Narrator',
        },
        {
          message: `"To finish the spell that can get us home again, I'll need some troll's blood.
          I've opened a portal to the home of such a creature on your right.               I'm sure he'll oblige."`,
          speaker: 'The Wizard',
        },
        {
          message: `"Just in case he doesn't, though,               you might want to find some equipment.
I'm sure you'll figure something out."`,
          speaker: 'The Wizard',
        },
        {
          message: `The wizard turns back to his rune-covered scrolls, 
ignoring any requests for more information.`,
          speaker: 'Narrator',
        },
      ])
    }
  },
}
