import { CreatureScript } from 'engine/api/creature-script'
import { Creature } from 'engine/creature'
import { CellCoordinate } from 'engine/map/map'
import { distance } from 'math'

const ValueKey = 'sensor.home'

/** Retrieve the coordinates of the creatures home */
export const getHome = (creature: Creature) => creature.getScriptData<CellCoordinate>(ValueKey, false)

/** Determines how far the given point is from the creature's home. */
export function getDistanceFromHome (creature: Creature, x: number, y: number): number;

/** Determines how far the given creature is from it's home. */
export function getDistanceFromHome (creature: Creature): number

export function getDistanceFromHome (creature: Creature, x?: number, y?: number): number {
  const home = getHome(creature)

  const xToTest = (x !== undefined && y !== undefined) ? x : creature.x
  const yToTest = (x !== undefined && y !== undefined) ? y : creature.y

  return distance(home.x, home.y, xToTest, yToTest)
}

/** Sensor that is aware of the creature's home (initial spawn point). */
export const homeSensor: CreatureScript = {
  onCreate: ({ creature }) => {
    creature.setScriptData(ValueKey, { x: creature.x, y: creature.y })
  },
}
