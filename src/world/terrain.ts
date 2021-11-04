import { Renderable } from './renderable'

export class TerrainType implements Renderable {
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
