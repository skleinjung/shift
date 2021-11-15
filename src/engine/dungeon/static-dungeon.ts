import { getAsset, MapAsset } from 'engine/assets'
import { Creature } from 'engine/creature'
import { ExpeditionMap } from 'engine/map/map'
import { find } from 'lodash/fp'

import { Dungeon } from './dungeon'

export class StaticDungeon extends Dungeon {
  private _map: MapAsset

  constructor (
    private _mapAssetName: string
  ) {
    super([])
    this._map = getAsset(this._mapAssetName)
  }

  public get width () {
    return this._map.width
  }

  public get height () {
    return this._map.height
  }

  public get left () {
    return this._map.offsetX
  }

  public get right () {
    return this.left + this.width - 1
  }

  public get top () {
    return this._map.offsetY
  }

  public get bottom () {
    return this.top + this.height - 1
  }

  public getDefaultTerrain () {
    return this._map.defaultTerrain
  }

  public createTerrain (map: ExpeditionMap) {
    this._map.scan((x, y, terrain) => {
      map.setTerrain(x, y, terrain)
    })
  }

  /** gets the creature type at the specified coordinate, or undefined if none */
  public getCreature (x: number, y: number): Creature | undefined {
    return find((creature) => creature.x === x && creature.y === y, this.creatures)
  }

  /** gets the terrain type at the specified coordinate of the dungeon */
  public getTerrain (x: number, y: number) {
    return this._map.getTerrain(x, y)
  }
}
