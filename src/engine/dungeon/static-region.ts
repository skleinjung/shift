import { MapAsset } from 'engine/assets'
import { ExpeditionMap } from 'engine/map/map'

import { BasicRegion } from './region'

/** Region of a dungeon that is loaded from a static map asset. */
export class StaticRegion extends BasicRegion {
  constructor (
    private _map: MapAsset
  ) {
    super({
      left: _map.offsetX,
      top: _map.offsetY,
      width: _map.width,
      height: _map.height,
    })
  }

  /**
   * Creates the terrain describing this Region on the given map.
   */
  public createTerrain (map: ExpeditionMap) {
    this._map.scan((x, y, terrain) => {
      map.setTerrain(x, y, terrain)
    })
  }
}
