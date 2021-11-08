import { MapFeature } from './map-feature'

export class TerrainType implements MapFeature {
  constructor (
    public readonly symbol: string,
    public readonly color: number,
    public readonly background = 0
  ) { }
}

export interface TerrainType extends MapFeature {
  /** indicates whether creatures can walk over this type of terrain */
  traversable: boolean
}

export const Terrain = {
  Default: {
    symbol: ' ',
    color: 0,
    background: 0,
    traversable: false,
  },
  Door: {
    symbol: '+',
    color: 0x555555,
    background: 0x111111,
    traversable: true,
  },
  Floor: {
    symbol: '.',
    color: 0x222222,
    background: 0x111111,
    traversable: true,
  },
  Water: {
    symbol: '`',
    color: 0x0096ff,
    background: 0x0000cc,
    traversable: false,
  },
  Wall: {
    symbol: '#',
    color: 0x555555,
    background: 0x333333,
    traversable: false,
  },
}
