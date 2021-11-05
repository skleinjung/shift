import { Renderable } from './renderable'

export class TerrainType implements Renderable {
  constructor (
    public readonly symbol: string,
    public readonly color: number,
    public readonly background = 0
  ) { }
}

export interface TerrainType extends Renderable {
  /** indicates whether creatures can walk over this type of terrain */
  traversable: boolean
}

export const Terrain: Record<string, TerrainType> = {
  Default: {
    symbol: ' ',
    color: 0,
    background: 0,
    traversable: false,
  },
  Floor: {
    symbol: '.',
    color: 0x222222,
    background: 0,
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
