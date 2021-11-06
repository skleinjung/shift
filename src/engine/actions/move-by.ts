import { Action, Moveable } from 'engine/types'

/** Move the creature a specified distance in each direction. */
export const MoveByAction = (entity: Moveable, x: number, y: number): Action => () => {
  // TODO: verify this is possible!
  entity.moveBy(x, y)
}
