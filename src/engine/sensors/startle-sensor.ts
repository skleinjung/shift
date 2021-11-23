import { CreatureScript } from 'engine/api/script-interfaces'
import { Creature } from 'engine/creature'

const KEY = 'sensor.startle'

interface StartleDetails {
  /** number of remaining turns until the creature calms down */
  turnsRemaining: number

  /** the creature that triggered the startle condition */
  startledBy: Creature

  /** how many turns since the creature was startled, which is zero if not startled */
  turns: number
}

/**
 * If the creature is startled, returns the creature that caused the startle. Otherwise, return
 * undefined.
 */
export const getStartledBy = (creature: Creature) => {
  return creature.getScriptData<StartleDetails>(KEY).startledBy
}

/**
 * Returns true if the specified creature is startled. The creature must have a 'startleSensor'
 * script, or else an error is thrown.
 **/
export const getStartledTurnsRemaining = (creature: Creature) => {
  return creature.getScriptData<StartleDetails>(KEY).turnsRemaining
}

/**
 * Returns how many turns the creature has been startled. Will be '0' if not startled, '1' the
 * first turn the startle was triggered, and then is incremented by 1 each subsequent turn.
 */
export const getStartledTurns = (creature: Creature) => {
  return creature.getScriptData<StartleDetails>(KEY).turns
}

/**
 * Returns true if the specified creature is startled. The creature must have a 'startleSensor'
 * script, or else an error is thrown.
 **/
export const isStartled = (creature: Creature) => getStartledTurnsRemaining(creature) !== 0

export interface StartleSensorOptions {
  /** the key used by the creatures detection sensor; (default: sensor.creatures) */
  creaturesSensorKey?: string

  /** the number of turns to flee after being startled */
  turnsToFlee: number
}

/**
 * Sensor script that detects a 'startle' condition. A creature is startled if it is attacked,
 * or senses the presence of other creatures. This relies on another sensor to detect
 * the creatures, and set them as script data (type: Creature[]) with a key specified when
 * building this sensor (default: sensor.creatures).
 */
export const startleSensor = ({
  creaturesSensorKey = 'sensor.creatures',
  turnsToFlee,
}: StartleSensorOptions): CreatureScript => ({
  onCreate: ({ creature }) => {
    creature.setScriptData(KEY, 0)
  },
  onDefend: ({ attack, creature }) => {
    creature.setScriptData(KEY, {
      startledBy: attack.attacker,
      turnsRemaining: turnsToFlee,
      turns: 0, // this will get incremented to '1' when our turn comes up
    })
  },
  onTurnStart: ({ creature }) => {
    const startle = creature.getScriptData<StartleDetails>(KEY, true)

    const creatures = creature.getScriptData<Creature[]>(creaturesSensorKey, true) ?? []

    const startledBy = creatures.length === 0 ? undefined : creatures[0]

    const turnsRemaining = startledBy !== undefined
      ? turnsToFlee
      : startle !== undefined && startle.turnsRemaining > 0
        ? startle.turnsRemaining - 1
        : 0

    const turns = turnsRemaining === 0
      ? 0
      : startle !== undefined && startle.turns > 0
        ? startle?.turns + 1
        : 1

    creature.setScriptData(KEY, {
      turnsRemaining,
      startledBy: startledBy ?? startle?.startledBy,
      turns,
    })
  },
})
