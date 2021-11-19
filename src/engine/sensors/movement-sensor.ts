import { Creature } from 'engine/creature'
import { CreatureEvents } from 'engine/events/creature-events'
import { CreatureScript, ScriptApi } from 'engine/script-api'
import { forEach } from 'lodash/fp'

const KEY_MOVE_EVENT_HANDLER = 'sensor.movement.handler'
const KEY_MONITORED_CREATURES = 'sensor.movement.monitored'
const KEY_MOVED_CREATURES = 'sensor.movement.matches'

/** Gets the list of creatures that the specified creature observed moving last turn. */
export const getCreaturesWithDetectedMovement = (creature: Creature) => {
  return creature.getScriptData<Creature[]>(KEY_MOVED_CREATURES)
}

export interface MovementSensorOptions {
  /**
   * Get the list of creatures to monitor for movement. Default is all creatures
   * in the world.
   */
  getCreatures?: (creature: Creature, environment: ScriptApi) => readonly Creature[]
}

const getAllCreatures = (_: Creature, environment: ScriptApi) => {
  return environment.creatures
}

export const movementSensor = ({
  getCreatures = getAllCreatures,
}: MovementSensorOptions): CreatureScript => {
  const handleMovement = (observer: Creature) => ({ creature }: CreatureEvents['move']) => {
    observer.getScriptData<Creature[]>(KEY_MOVED_CREATURES).push(creature)
  }

  return {
    onCreate: ({ creature }) => {
      creature.setScriptData(KEY_MOVE_EVENT_HANDLER, handleMovement(creature))
      creature.setScriptData(KEY_MONITORED_CREATURES, [])
      creature.setScriptData(KEY_MOVED_CREATURES, [])
    },
    onTurnStart: ({ creature }) => {
      const oldMonitored = creature.getScriptData<Creature[]>(KEY_MONITORED_CREATURES)
      const moveEventHandler = creature.getScriptData<(...args: any[]) => void>(KEY_MOVE_EVENT_HANDLER)
      forEach((observed) => {
        observed.off('move', moveEventHandler)
      }, oldMonitored)
    },
    onTurnEnd: ({ creature }, api) => {
      creature.setScriptData(KEY_MOVED_CREATURES, [])
      const moveEventHandler = creature.getScriptData<(...args: any[]) => void>(KEY_MOVE_EVENT_HANDLER)

      const newObserved = getCreatures(creature, api)
      forEach((observed) => {
        observed.on('move', moveEventHandler)
      }, newObserved)

      creature.setScriptData(KEY_MONITORED_CREATURES, newObserved)
    },
  }
}
