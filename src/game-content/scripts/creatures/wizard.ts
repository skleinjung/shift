import { CreatureScript } from 'engine/api/script-interfaces'

import { TROLL_BLOOD_SPLATTER_NAME } from '../items/troll-blood'

export const wizard: CreatureScript = {
  onTrade: async ({ accept, api, creature, item }) => {
    if (item.name === TROLL_BLOOD_SPLATTER_NAME) {
      accept()

      await api.showSpeech([
        {
          message: 'Finally! We can get out of this wretched forest. Come, then. Let\'s get back to to the tower.',
          speaker: creature.name,
        },
      ]).then(() => {
        api.win()
      })
    }
  },
}
