import { Creature } from 'engine/creature'
import { Item } from 'engine/item'
import { ExpeditionMap } from 'engine/map/map'
import { TerrainTypes } from 'engine/terrain-db'
import { filter, forEach, some } from 'lodash/fp'

import { Region, RegionTypeName } from './region'

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
    public regions: Region[]
  ) { }

  public getDefaultTerrain () {
    return TerrainTypes.default
  }

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
  public wouldFit (region: Region, minDistance = 0): boolean {
    return !some(
      (other) => region.overlaps(other, minDistance),
      this.regions
    )
  }

  public createMap (): ExpeditionMap {
    const map = new ExpeditionMap()
    map.DefaultTerrain = this.getDefaultTerrain()

    this.createTerrain(map)

    forEach((treasure) => {
      map.getCell(treasure.x, treasure.y).addItem(treasure.item)
    }, this.treasure)

    forEach((creature) => {
      map.setCreature(creature.x, creature.y, creature)
    }, this.creatures)

    return map
  }

  public createTerrain (map: ExpeditionMap) {
    forEach((region) => {
      region.createTerrain(map)
    }, this.regions)
  }
}
