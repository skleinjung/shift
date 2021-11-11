import { Creature } from 'engine/creature'
import { Item } from 'engine/item'
import { ExpeditionMap } from 'engine/map/map'
import { filter, forEach, some } from 'lodash/fp'

import { Region, RegionTypeName } from './region'

export interface DungeonGeography {
  /** Gets all regions of a specifie type */
  getRegions: (type: RegionTypeName) => Region[]

  /** Helper accessor to get all 'room' regions. */
  rooms: Region[]

  /** Helper accessor to get all 'tunnel' regions. */
  tunnels: Region[]
}

export class Dungeon implements DungeonGeography {
  /**
   * set of creatures in this dungeon
   */
  public readonly creatures: Creature[] = []

  public readonly treasure: { item: Item; x: number; y: number }[] = []

  constructor (
    /** set of regions in this dungeon */
    public readonly regions: Region[]
  ) { }

  /** Gets all regions of a specifie type */
  public getRegions (type: RegionTypeName) {
    return filter((region) => region.type === type, this.regions)
  }

  /** Helper accessor to get all 'room' regions. */
  public get rooms () {
    return this.getRegions('room')
  }

  /** Helper accessor to get all 'tunnel' regions. */
  public get tunnels () {
    return this.getRegions('tunnel')
  }

  public createTerrain (map: ExpeditionMap) {
    forEach((region) => {
      region.createTerrain(map)
    }, this.regions)
  }

  /**
   * Returns true if the specified room would fit in this dungeon without overlapping any
   * other rooms. Overlapping a tunnel is allowed.
   *
   * @param minDistance see Room#overlaps
   */
  public wouldFit (region: Region, minDistance = 0): boolean {
    return !some(
      (other) => region.overlaps(other, minDistance),
      this.regions
    )
  }
}
