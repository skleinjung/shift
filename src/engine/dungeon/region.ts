import { ExpeditionMap } from 'engine/map/map'
import { random } from 'engine/random'
import { TerrainType, TerrainTypes } from 'engine/terrain-db'

export interface CreatureSpawn {
  type: string
  x: number
  y: number
}

export const RegionTypes = [
  'room',
  'tunnel',
] as const
export type RegionTypeName = (typeof RegionTypes)[number]

export type TerrainTypeProviderFunction = () => TerrainType
export interface TerrainTypeProvider {
  door: TerrainTypeProviderFunction
  floor: TerrainTypeProviderFunction
  wall: TerrainTypeProviderFunction
}

const defaultTerrainTypes: TerrainTypeProvider = {
  door: () => TerrainTypes.door,
  floor: () => TerrainTypes.floor,
  wall: () => TerrainTypes.wall,
}

/**
 * A contiguous area of a dungeon with similar characteristics, such as a room or tunnel.
 *
 * The dimension properties specify the interior of a region, and do not include any surrounding
 * walls it might have.
 *
 * TODO: support regions without walls
 * TODO: add metadata, such as description/etc.
 */
export class Region {
  /** left extent of the region */
  public readonly left: number
  /** top extent of the region */
  public readonly top: number
  /** width of the region */
  public readonly width: number
  /** height of the region */
  public readonly height: number

  /** the type of region */
  public readonly type: RegionTypeName

  public readonly creatures: CreatureSpawn[] = []

  public readonly terrainTypes: TerrainTypeProvider

  constructor ({ left, top, width, height, type = 'room', terrainTypes = defaultTerrainTypes }: {
    left: number
    top: number
    width: number
    height: number
    type?: RegionTypeName
    terrainTypes?: TerrainTypeProvider
  }) {
    this.left = left
    this.top = top
    this.width = width
    this.height = height
    this.type = type
    this.terrainTypes = terrainTypes
  }

  /** right extent of the region */
  public get right () {
    return this.left + this.width - 1
  }

  /** bottom extent of the region */
  public get bottom () {
    return this.top + this.height - 1
  }

  public addCreature (type: string, x: number, y: number) {
    this.creatures.push({ type, x, y })
  }

  // minDistance 0 === can share a wall; minDistance - 1 == minimum hallway length
  public overlaps (other: Region, minDistance = 0): boolean {
    // the -1s account for the walls

    // on room on left side of other
    if (this.left - 1 > other.right + minDistance || other.left - 1 > this.right + minDistance) {
      return false
    }

    // one on top of other
    if (this.top - 1 > other.bottom + minDistance || other.top - 1 > this.bottom + minDistance) {
      return false
    }

    return true
  }

  /**
   * Creates the terrain describing this Region on the given map.
   */
  public createTerrain (map: ExpeditionMap) {
    // create floors
    for (let y = this.top; y <= this.bottom; y++) {
      for (let x = this.left; x <= this.right; x++) {
        if (this.type === 'tunnel' && map.getTerrain(x, y) === this.terrainTypes.wall()) {
          const terrain = Math.random() < 0.35
            ? this.terrainTypes.door()
            : this.terrainTypes.floor()
          map.setTerrain(x, y, terrain)
        } else {
          map.setTerrain(x, y, this.terrainTypes.floor())
        }
      }
    }

    // create vertical walls
    for (let y = this.top - 1; y <= this.bottom + 1; y++) {
      if (!map.hasCell(this.left - 1, y)) {
        map.setTerrain(this.left - 1, y, this.terrainTypes.wall())
      }

      if (!map.hasCell(this.right + 1, y)) {
        map.setTerrain(this.right + 1, y, this.terrainTypes.wall())
      }
    }

    // create horizontal walls
    for (let x = this.left - 1; x <= this.right + 1; x++) {
      if (!map.hasCell(x, this.top - 1)) {
        map.setTerrain(x, this.top - 1, this.terrainTypes.wall())
      }

      if (!map.hasCell(x, this.bottom + 1)) {
        map.setTerrain(x, this.bottom + 1, this.terrainTypes.wall())
      }
    }
  }
}

const ForestTerrainTypes: TerrainTypeProvider = {
  door: () => TerrainTypes.brambles,
  floor: () => {
    switch (random(1, 3)) {
      case 1:
        return TerrainTypes.light_brush_1
      case 2:
        return TerrainTypes.light_brush_2
      default:
        return TerrainTypes.light_brush_3
    }
  },
  wall: () => TerrainTypes.heavy_brush,
}

const ForestPathTerrainTypes: TerrainTypeProvider = {
  door: () => TerrainTypes.brambles,
  floor: () => TerrainTypes.path,
  wall: () => TerrainTypes.heavy_brush,
}

export class ForestClearing extends Region {
  constructor ({ left, top, width, height }: {
    left: number
    top: number
    width: number
    height: number
  }) {
    super({ left, top, width, height, terrainTypes: ForestTerrainTypes })
  }
}

export class ForestPath extends Region {
  constructor ({ left, top, width, height }: {
    left: number
    top: number
    width: number
    height: number
  }) {
    super({ left, top, width, height, type: 'tunnel', terrainTypes: ForestPathTerrainTypes })
  }
}
