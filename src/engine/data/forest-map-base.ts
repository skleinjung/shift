import { MapImageConfig } from 'engine/assets'
import { TerrainTypes } from 'engine/terrain-db'

import forest from './forest-map-base.png'

export const ForestMapBase: MapImageConfig = {
  colorMap: {
    0x002d00: TerrainTypes.heavy_brush,
    0x473c21: TerrainTypes.path,
    0x00ffff: TerrainTypes.water_shallow,
    0x0000ff: TerrainTypes.water,
    0x1df721: TerrainTypes.light_brush_1,
    0x6dff6c: TerrainTypes.light_brush_2,
    0xa6ffa6: TerrainTypes.light_brush_3,
  },
  defaultTerrain: TerrainTypes.heavy_brush,
  id: 'forest_base',
  offsetX: -71,
  offsetY: -149,
  source: forest,
}
