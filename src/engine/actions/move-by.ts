import { Action, Moveable } from 'engine/types'

/** Move the creature a specified distance in each direction. */
export class MoveByAction implements Action {
  constructor (
    private _entity: Moveable,
    private _x: number,
    private _y: number) { }

  public execute () {
    // TODO: verify this is possible!
    this._entity.moveBy(this._x, this._y)
    return true
  }
}
