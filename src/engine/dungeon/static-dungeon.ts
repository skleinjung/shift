import { getAsset } from 'engine/assets'
import { ExpeditionMap } from 'engine/map/map'

import { Dungeon } from './dungeon'

export class StaticDungeon extends Dungeon {
  constructor (
    private _mapAssetName: string,
    private _xOffset = -50,
    private _yOffset = -50
  ) {
    super([])
  }

  public createTerrain (map: ExpeditionMap) {
    const mapData = getAsset(this._mapAssetName)
    mapData.scan((x, y, terrain) => {
      map.setTerrain(this._xOffset + x, this._yOffset + y, terrain)
    })
  }
}
