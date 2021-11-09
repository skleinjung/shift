import { Creature } from 'engine/creature'
import { Action } from 'engine/types'
import { World } from 'engine/world'

/** Move the creature a specified distance in each direction. */
export class MoveByAction implements Action {
  constructor (
    private _entity: Creature,
    private _x: number,
    private _y: number) { }

  public execute (world: World) {
    const oldX = this._entity.x
    const oldY = this._entity.y
    const newX = oldX + this._x
    const newY = oldY + this._y

    // check if we can move there
    if (!world.map.isTraversable(newX, newY)) {
      return false
    }

    // remove entity from old cell
    if (world.map.getCreature(oldX, oldY) === this._entity) {
      world.map.setCreature(oldX, oldY, undefined)
    }

    // place creature in new cell
    world.map.setCreature(newX, newY, this._entity)

    this._entity.moveTo(newX, newY)
    return true
  }
}
