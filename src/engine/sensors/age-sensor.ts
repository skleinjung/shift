import { CreatureScript } from 'engine/api/creature-script'
import { Creature } from 'engine/creature'

const ValueKey = 'sensor.age'

/** Uses the age sensor to get the number of turns a creature has been alive. */
export const getAge = (creature: Creature) => creature.getScriptData<number>(ValueKey, false)

/** Sensor that determines how long a creature has been alive. */
export const ageSensor: CreatureScript = {
  onCreate: ({ creature }) => {
    creature.setScriptData(ValueKey, 0)
  },
  onTurnEnd: ({ creature }) => {
    creature.setScriptData(ValueKey, (creature.getScriptData<number>(ValueKey, true) ?? 0) + 1)
  },
}
