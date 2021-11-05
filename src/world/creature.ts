import { CreatureType } from 'db/creatures'

import { ExpeditionMap } from './map'

/**
 * TODO: emit events instead of directly updating map
 */
export class Creature {
  constructor (
    public readonly id: number,
    public readonly type: CreatureType,
    private _x: number,
    private _y: number,
    private _map: ExpeditionMap
  ) {
    if (this._map.getCreatureId(this._x, this._y) !== undefined) {
      throw new Error('TODO: do not fail when adding creature to occupied cell')
    }

    this._map.setCreatureId(this._x, this._y, this.id)
  }

  public get x () {
    return this._x
  }

  public get y () {
    return this._y
  }

  /**
   * Moves a creature the specified distance in each axis. If the move is impossible, will return false.
   * If the move is completed, then true is returned.
   */
  public moveBy (x: number, y: number) {
    const newX = this._x + x
    const newY = this._y + y

    if (!this._map.isTraversable(newX, newY)) {
      return false
    }

    if (this._map.getCreatureId(this._x, this._y) === this.id) {
      this._map.setCreatureId(this._x, this._y, undefined)
    }

    this._x = newX
    this._y = newY

    this._map.setCreatureId(this._x, this._y, this.id)
    return true
  }
}
