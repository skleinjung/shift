import { atom, selector } from 'recoil'

import { playerState } from './player'

class TerrainType {
  constructor (
    public readonly symbol: string,
    public readonly color: number,
    public readonly background = 0
  ) { }
}

export const Terrain = {
  Default: new TerrainType(' ', 0xff00ff),
  Floor: new TerrainType('.', 0x222222),
  Water: new TerrainType('`', 0x0096FF, 0x0000cc),
  Wall: new TerrainType('#', 0x555555, 0x333333),
}

export interface MapCell {
  terrain: TerrainType
}

const createDefaultMap = () => {
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

  const result: MapCell[][] = []

  for (let y = -200; y < 200; y++) {
    result[y] = []

    for (let x = -200; x < 200; x++) {
      result[y][x] = {
        terrain: getTerrain(x, y),
      }
    }
  }

  return result
}

export const mapState = atom<MapCell[][]>({
  key: 'mapState',
  default: createDefaultMap(),
})

export const selectOffsetX = selector({
  key: 'mapOffsetX',
  get: ({ get }) => {
    const player = get(playerState)
    return player.position.x
  },
})

export const selectOffsetY = selector({
  key: 'mapOffsetY',
  get: ({ get }) => {
    const player = get(playerState)
    return player.position.y
  },
})
