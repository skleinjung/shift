import { Creature } from 'engine/creature'
import { Action } from 'engine/types'
import { World } from 'engine/world'

/** Move the creature to a specific location. */
export class MoveToAction implements Action {
  constructor (
    private _entity: Creature,
    private _x: number,
    private _y: number) { }

  public execute (world: World) {
    const oldX = this._entity.x
    const oldY = this._entity.y

    // check if we can move there
    if (!world.map.isTraversable(this._x, this._y)) {
      return false
    }

    // remove entity from old cell
    if (world.map.getCreature(oldX, oldY) === this._entity) {
      world.map.setCreature(oldX, oldY, undefined)
    }

    // place creature in new cell
    world.map.setCreature(this._x, this._y, this._entity)

    this._entity.moveTo(this._x, this._y)
    return true
  }
}
