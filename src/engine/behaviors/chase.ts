import { Creature } from 'engine/creature'
import { Behavior } from 'engine/types'

import { pathFindingBehavior } from './path-finding-behavior'

export const chase = (target: Creature): Behavior => pathFindingBehavior(() => {
  if (target.dead) {
    // target is dead, nothing to chase
    return undefined
  }

  // return the target (which implements coordinate)
  return target
})
