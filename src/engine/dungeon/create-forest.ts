import { getAsset } from 'engine/assets'
import { random } from 'engine/random'
import { TerrainTypes } from 'engine/terrain-db'
import { times } from 'lodash/fp'

import { Dungeon } from './dungeon'
import { Region, TerrainTypeProvider } from './region'
import { StaticRegion } from './static-region'
import { generateRoomDimensions } from './utils'

const ForestTerrainTypes: TerrainTypeProvider = {
  door: () => TerrainTypes.brambles,
  floor: () => {
    switch (random(1, 3)) {
      case 1:
        return TerrainTypes.light_brush_1
      case 2:
        return TerrainTypes.light_brush_2
      default:
        return TerrainTypes.light_brush_3
    }
  },
  wall: () => TerrainTypes.heavy_brush,
}

export const createForest = () => {
  const baseMap = new StaticRegion(getAsset('forest_base'))

  const clearings = times(() => {
    const { width, height } = generateRoomDimensions({
      maximumRoomArea: 50,
      minimumRoomArea: 16,
      roomIrregularity: 1,
    })

    const left = baseMap.left + random(0, baseMap.width - width)
    const top = baseMap.top + random(0, baseMap.height - height)

    return new Region({
      left,
      top,
      width,
      height,
      type: 'room',
      terrainTypes: ForestTerrainTypes,
    })
  }, 25)

  return new Dungeon([
    baseMap,
    ...clearings,
  ])
}
