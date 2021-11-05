import { Terrain } from 'db/terrain'

import { ExpeditionMap } from './map'

export const createPrototypeTerrain = (map: ExpeditionMap) => {
  const inside = (x1: number, y1: number, x2: number, y2: number) => (x: number, y: number) => {
    return x >= x1 && x < x2 && y >= y1 && y < y2
  }

  const inCenterRoom = inside(-15, -15, 15, 15)
  const inLakeInCenterRoom = inside(-40, -20, -40, -20)
  const inHorizontalHallway = inside(-200, -5, 200, 5)
  const inVerticalRiver = inside(-5, -200, 5, 200)

  const getTerrain = (x: number, y: number) => {
    if (inCenterRoom(x, y)) {
      if (inLakeInCenterRoom(x, y)) {
        return Terrain.Water
      } else {
        return Terrain.Floor
      }
    } else if (inHorizontalHallway(x, y)) {
      return Terrain.Floor
    } else if (inVerticalRiver(x, y)) {
      return Terrain.Water
    } else {
      return Terrain.Wall
    }
  }

  for (let y = -200; y < 200; y++) {
    for (let x = -200; x < 200; x++) {
      map.setTerrain(x, y, getTerrain(x, y))
    }
  }

  return map
}
