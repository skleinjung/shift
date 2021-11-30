import { CreatureScript } from 'engine/api/script-interfaces'

import { TROLL_BLOOD_SPLATTER_NAME } from '../items/troll-blood'

export const wizard: CreatureScript = {
  onTrade: ({ accept, api, creature, item }) => {
    if (item.name === TROLL_BLOOD_SPLATTER_NAME) {
      accept()

      api.showSpeech([
        {
          message: 'Thank you!',
          speaker: creature.name,
        },
      ])
    }
  },
}
