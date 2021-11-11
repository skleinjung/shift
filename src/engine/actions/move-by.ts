import { Creature } from 'engine/creature'

import { MoveToAction } from './move-to'

/** Move the creature a specified distance in each direction. */
export class MoveByAction extends MoveToAction {
  constructor (
    entity: Creature,
    x: number,
    y: number) {
    super(entity, x + entity.x, y + entity.y)
  }
}
