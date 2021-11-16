import { Creature } from 'engine/creature'
import { Item } from 'engine/item'
import { ExpeditionMap } from 'engine/map/map'
import { TerrainTypes } from 'engine/terrain-db'
import { filter, forEach, some } from 'lodash/fp'

import { BasicRegion, Region, RegionTypeName } from './region'

export interface DungeonGeography {
  /** Gets all regions of a specifie type */
  getRegions: (type: RegionTypeName) => Region[]

  /** Helper accessor to get all 'room' regions. */
  rooms: readonly Region[]

  /** Helper accessor to get all 'tunnel' regions. */
  tunnels: readonly Region[]
}

export class Dungeon implements DungeonGeography {
  /**
   * set of creatures in this dungeon
   */
  public creatures: Creature[] = []

  public treasure: { item: Item; x: number; y: number }[] = []

  constructor (
    /** set of regions in this dungeon */
    public regions: Region[],
    public defaultTerrain = TerrainTypes.default
  ) { }

  /** Gets all regions of a specifie type */
  public getRegions (type: RegionTypeName) {
    return filter((region) => region.type === type, this.regions)
  }

  /** Helper accessor to get all 'room' regions. */
  public get rooms (): readonly Region[] {
    return this.getRegions('room')
  }

  /** Helper accessor to get all 'tunnel' regions. */
  public get tunnels (): readonly Region[] {
    return this.getRegions('tunnel')
  }

  /**
   * Returns true if the specified room would fit in this dungeon without overlapping any
   * other rooms. Overlapping a tunnel is allowed.
   *
   * @param minDistance see Room#overlaps
   */
  public wouldFit (region: BasicRegion, minDistance = 0): boolean {
    return !some(
      (other) => region.overlaps(other, minDistance),
      this.regions
    )
  }

  public createMap (): ExpeditionMap {
    const map = new ExpeditionMap()
    map.DefaultTerrain = this.defaultTerrain

    this.createTerrain(map)

    return map
  }

  /** Invokes a callback for every creature in this dungeon. */
  public forEachCreature (callback: (creature: Creature) => void) {
    forEach(callback, this.creatures)
  }

  /**
   * Invokes a callback for every treasure (item) in this dungeon. The callback is invoked with the
   * item, and the (x, y) coordinates of where it should be placed.
   */
  public forEachItem (callback: (item: Item, x: number, y: number) => void) {
    forEach(({ item, x, y }) => {
      callback(item, x, y)
    }, this.treasure)
  }

  public createTerrain (map: ExpeditionMap) {
    forEach((region) => {
      region.createTerrain(map)
    }, this.regions)
  }
}
