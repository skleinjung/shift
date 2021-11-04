import { selector } from 'recoil'
import { Terrain, TerrainType } from 'world/terrain'

import { Creature } from './creature'
import { playerState } from './player'

export interface MapCell {
  creature?: Creature
  terrain: TerrainType
}

export type Map = MapCell[][]

const createDefaultMap = (): Map => {
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

  const map: MapCell[][] = []

  for (let y = -200; y < 200; y++) {
    map[y] = []

    for (let x = -200; x < 200; x++) {
      map[y][x] = {
        terrain: getTerrain(x, y),
      }
    }
  }

  return map
}

export const selectOffsetX = selector({
  key: 'mapOffsetX',
  get: ({ get }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const player = get(playerState)
    return -20 // player.x
  },
})

export const selectOffsetY = selector({
  key: 'mapOffsetY',
  get: ({ get }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const player = get(playerState)
    return -20 // player.y
  },
})

const map = createDefaultMap()
export const getMap = () => map
