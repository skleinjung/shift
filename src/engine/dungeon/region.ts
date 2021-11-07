import { Terrain } from 'db/terrain'
import { ExpeditionMap } from 'engine/map'

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

  constructor ({ left, top, width, height, type = 'room' }: {
    left: number
    top: number
    width: number
    height: number
    type?: RegionTypeName
  }) {
    this.left = left
    this.top = top
    this.width = width
    this.height = height
    this.type = type
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
        if (this.type === 'tunnel' && map.getTerrain(x, y) === Terrain.Wall) {
          const terrain = Math.random() < 0.35 ? Terrain.Door : Terrain.Floor
          map.setTerrain(x, y, terrain)
        } else {
          map.setTerrain(x, y, Terrain.Floor)
        }
      }
    }

    // create vertical walls
    for (let y = this.top - 1; y <= this.bottom + 1; y++) {
      if (map.getTerrain(this.left - 1, y) === Terrain.Default) {
        map.setTerrain(this.left - 1, y, Terrain.Wall)
      }

      if (map.getTerrain(this.right + 1, y) === Terrain.Default) {
        map.setTerrain(this.right + 1, y, Terrain.Wall)
      }
    }

    // create horizontal walls
    for (let x = this.left - 1; x <= this.right + 1; x++) {
      if (map.getTerrain(x, this.top - 1) === Terrain.Default) {
        map.setTerrain(x, this.top - 1, Terrain.Wall)
      }

      if (map.getTerrain(x, this.bottom + 1) === Terrain.Default) {
        map.setTerrain(x, this.bottom + 1, Terrain.Wall)
      }
    }
  }
}
