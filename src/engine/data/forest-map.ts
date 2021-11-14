import { MapImageConfig } from 'engine/assets'
import { TerrainTypes } from 'engine/terrain-db'

import forest from './forest-map-small.png'

export const ForestMap: MapImageConfig = {
  colorMap: {
    0x002d00: TerrainTypes.heavy_brush,
    0x473c21: TerrainTypes.brambles,
    0x00ffff: TerrainTypes.water_shallow,
    0x1df721: TerrainTypes.light_brush_1,
    0x6dff6c: TerrainTypes.light_brush_2,
    0xa6ffa6: TerrainTypes.light_brush_3,
  },
  defaultTerrain: TerrainTypes.heavy_brush,
  id: 'forest',
  offsetX: -7,
  offsetY: -49,
  source: forest,
}
