import { getAsset, MapAsset } from 'engine/assets'
import { ExpeditionMap } from 'engine/map/map'

import { Dungeon } from './dungeon'

export class StaticDungeon extends Dungeon {
  private _map: MapAsset

  constructor (
    private _mapAssetName: string
  ) {
    super([])
    this._map = getAsset(this._mapAssetName)
  }

  public getDefaultTerrain () {
    return this._map.defaultTerrain
  }

  public createTerrain (map: ExpeditionMap) {
    this._map.scan((x, y, terrain) => {
      map.setTerrain(this._map.offsetX + x, this._map.offsetY + y, terrain)
    })
  }
}
