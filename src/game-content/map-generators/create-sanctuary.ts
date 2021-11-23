import { Dungeon } from 'engine/dungeon/dungeon'
import { OrganicRegion } from 'engine/dungeon/organic-region'
import { BasicRegion } from 'engine/dungeon/region'
import { random } from 'engine/random'
import { TerrainTypes } from 'engine/terrain-db'

export const createSanctuary = () => {
  return new Dungeon(
    [
      new OrganicRegion(0, -5, 200),
      new BasicRegion({
        left: -5,
        top: -10,
        width: 11,
        height: 11,
        terrainTypes: {
          door: () => TerrainTypes.light_brush_2,
          floor: () => random(0, 99) < 20 ? TerrainTypes.light_brush_3 : TerrainTypes.light_brush_2,
          wall: () => TerrainTypes.heavy_brush,
        },
      }),
    ],
    TerrainTypes.heavy_brush
  )
}
