import { ExpeditionMap } from 'engine/map/map'
import { getAdjacentCoordinates } from 'engine/map/map-utils'
import { random } from 'engine/random'
import { TerrainTypes } from 'engine/terrain-db'
import { pullAt } from 'lodash'
import { forEach, takeRight } from 'lodash/fp'

import { RegionTypeName } from './region'

export class OrganicRegion {
  private _left: number
  private _top: number
  private _right: number
  private _bottom: number

  constructor (
    private _xOrigin: number,
    private _yOrigin: number,
    private _size: number
  ) {
    this._left = _xOrigin
    this._right = _xOrigin
    this._top = _yOrigin
    this._bottom = _yOrigin
  }

  public createTerrain (map: ExpeditionMap) {
    const possibleNewCells = [{ x: this._xOrigin, y: this._yOrigin }]

    const hasFlowers = random(0, 100) < 20

    let size = 0
    while (size++ < this._size && possibleNewCells.length > 0) {
      const index = random(0, possibleNewCells.length - 1)
      const [newCell] = pullAt(possibleNewCells, index)

      const neighbors = getAdjacentCoordinates(newCell)
      forEach((neighbor) => {
        if (map.getTerrain(neighbor.x, neighbor.y).id === 'heavy_brush') {
          possibleNewCells.push(neighbor)
        }
      }, neighbors)

      this._left = Math.min(this._left, newCell.x)
      this._right = Math.max(this._right, newCell.x)
      this._top = Math.min(this._top, newCell.y)
      this._bottom = Math.max(this._bottom, newCell.y)

      const terrain = hasFlowers && random(0, 99) < 20
        ? TerrainTypes.light_brush_1
        : TerrainTypes.light_brush_2
      map.setTerrain(newCell.x, newCell.y, terrain)
    }

    const addedDensity = takeRight(possibleNewCells.length / 3, possibleNewCells)
    forEach((cell) => {
      map.setTerrain(cell.x, cell.y, TerrainTypes.light_brush_3)
    }, addedDensity)
  }

  public get left () {
    return this._left
  }

  public get top () {
    return this._top
  }

  public get right () {
    return this._right
  }

  public get bottom () {
    return this._bottom
  }

  public get width () {
    return this.right - this.left + 1
  }

  public get height () {
    return this.bottom - this.top + 1
  }

  public get type (): RegionTypeName {
    return 'room'
  }
}
