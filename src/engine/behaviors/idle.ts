import { DoNothing } from 'engine/actions/do-nothing'
import { random } from 'engine/random'
import { Behavior } from 'engine/types'

export const maybeIdle = (behavior: Behavior, idleChance: number): Behavior => (creature, world) => {
  return random(0, 99) < idleChance
    ? DoNothing
    : behavior(creature, world)
}
