import { Behavior } from 'engine/types'

/**
 * Iterate a list of behaviors, and return the first non-undefined action provided. If all behaviors
 * return undefined, this will return undefined as well.
 */
export const BehaviorChain = (...behaviors: Behavior[]): Behavior => (creature, world) => {
  for (const behavior of behaviors) {
    const action = behavior(creature, world)
    if (action !== undefined) {
      return action
    }
  }

  return undefined
}
