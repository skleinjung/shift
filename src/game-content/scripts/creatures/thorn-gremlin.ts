import { CreatureScript } from 'engine/script-api'

const KEY_HOME_COORDINATE = 'home'

export const dartLizard: CreatureScript = {
  onCreate: ({ creature }) => {
    creature.setScriptData(KEY_HOME_COORDINATE, { x: creature.x, y: creature.y })
  },
}
