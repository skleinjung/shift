import { CreatureTypeId } from 'engine/creature-db'
import { Item } from 'engine/item'
import { ExpeditionMap } from 'engine/map'
import { filter, forEach, some } from 'lodash/fp'

import { Region, RegionTypeName } from './region'

export class Dungeon {
  /**
   * set of creatures in this dungeon
   *
   * TODO: this should be real creature objects, to avoid the post-processing by the World
   * this is awkward, due to the requirement from Creature to have a map (which we should remove)
   */
  public readonly creatures: { type: CreatureTypeId; x: number; y: number }[] = []

  public readonly treasure: { item: Item; x: number; y: number }[] = []

  constructor (
    /** set of regions in this dungeon */
    public readonly regions: Region[]
  ) { }

  /** Gets all regions of a specifie typ0e */
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
