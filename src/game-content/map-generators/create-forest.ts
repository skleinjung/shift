import { getAsset } from 'engine/assets'
import { ExpeditionMap } from 'engine/map/map'
import { PathCostFunction } from 'engine/map/path-cost-functions'
import { random } from 'engine/random'
import { TerrainTypes } from 'engine/terrain-db'
import { forEach, times } from 'lodash/fp'

import { Dungeon } from '../../engine/dungeon/dungeon'
import { OrganicRegion } from '../../engine/dungeon/organic-region'
import { BasicRegion, Region } from '../../engine/dungeon/region'
import { StaticRegion } from '../../engine/dungeon/static-region'

const cellCosts: Record<string, number> = {}

export const randomCosts = ({
  maximumCost = 10,
}: { maximumCost?: number } = {}): PathCostFunction => {
  return (_, to) => {
    const cellKey = `${to.x},${to.y}`
    if (cellCosts[cellKey] === undefined) {
      cellCosts[cellKey] = random(1, maximumCost)
    }

    return cellCosts[cellKey]
  }
}

class ForestPathRegion extends BasicRegion {
  constructor (
    private _region1: Region,
    private _region2: Region
  ) {
    super({
      left: Math.min(_region1.left, _region2.left),
      top: Math.min(_region1.top, _region2.top),
      width: Math.max(_region1.right, _region2.right) - Math.min(_region1.left, _region2.left),
      height: Math.max(_region1.bottom, _region2.bottom) - Math.min(_region1.top, _region2.top),
    })
  }

  public createTerrain (map: ExpeditionMap) {
    const point1 = {
      x: random(this._region1.left, this._region1.right),
      y: random(this._region1.top, this._region1.bottom),
    }
    const point2 = {
      x: random(this._region2.left, this._region2.right),
      y: random(this._region2.top, this._region2.bottom),
    }

    const path = map.getPath(point1, point2, {
      costFunction: randomCosts({ maximumCost: 1000 }),
    })

    const createPath = (x: number, y: number, overwrite = false) => {
      if (overwrite || map.getTerrain(x, y) === TerrainTypes.heavy_brush) {
        map.setTerrain(x, y, TerrainTypes.path)
        cellCosts[`${x},${y}`] = 0
      }
    }

    const createClearedArea = (x: number, y: number) => {
      if (map.getTerrain(x, y) === TerrainTypes.heavy_brush) {
        // map.setTerrain(x, y, extension < 80 ? TerrainTypes.light_brush_3 : ForestTerrainTypes.floor())
        map.setTerrain(x, y, TerrainTypes.light_brush_2)
      }
    }

    forEach((cell) => {
      const extendOne = (x: number, y: number) => {
        const extension = random(0, 99)
        if (extension < 75) {
          createClearedArea(x, y)
        }
      }

      // const extendTwo = (x: number, y: number) => {
      //   const extension = random(0, 99)
      //   if (extension < 35) {
      //     createClearedArea(x, y)
      //   }
      // }

      extendOne(cell.x - 1, cell.y)
      extendOne(cell.x, cell.y - 1)
      extendOne(cell.x, cell.y + 1)
      extendOne(cell.x + 1, cell.y)

      createClearedArea(cell.x - 1, cell.y - 1)
      createClearedArea(cell.x + 1, cell.y - 1)
      createClearedArea(cell.x - 1, cell.y + 1)
      createClearedArea(cell.x + 1, cell.y + 1)

      createPath(cell.x, cell.y, true)
    }, path)
  }
}

export const createForest = () => {
  const baseMap = new StaticRegion(getAsset('forest_base'))

  const clearings = times(() => {
    const size = random(25, 125)

    // + 1 here, and -2 below, are so our walls don't go outside the intended bounds
    const x = baseMap.left + random(0, baseMap.width) + 1
    const y = baseMap.top + random(0, baseMap.height) + 1

    return new OrganicRegion(x, y, size)
  }, 30)

  const paths = times(() => {
    return new ForestPathRegion(
      clearings[random(0, clearings.length - 1)],
      clearings[random(0, clearings.length - 1)]
    )
  }, 2)

  const clueRegion = new BasicRegion({
    left: -15,
    top: -40,
    width: 1,
    height: 1,
  })

  paths.push(new ForestPathRegion(
    new BasicRegion({
      left: 0,
      top: 0,
      width: 1,
      height: 1,
    }),
    clueRegion
  ))

  paths.push(new ForestPathRegion(
    clueRegion,
    new BasicRegion({
      left: clueRegion.left,
      top: clueRegion.top - 11,
      width: 1,
      height: 1,
    })
  ))

  return new Dungeon(
    [
      baseMap,
      ...clearings,
      ...paths,
    ],
    TerrainTypes.heavy_brush
  )
}
