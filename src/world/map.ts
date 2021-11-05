import { Terrain, TerrainType } from 'db/terrain'
import { selector } from 'recoil'

import { playerState } from '../state/player'

import { Creature } from './creature'

export interface MapCell {
  creatureId?: number
  terrain: TerrainType
}

const DefaultCell = {
  terrain: Terrain.Default,
}

export class ExpeditionMap {
  private _cells: MapCell[][] = []

  public getCell (x: number, y: number): Readonly<MapCell> {
    return this._getCell(x, y) ?? DefaultCell
  }

  /**
   * Determines if a creature can enter the cell with the specified coordinates. Will return true in
   * this case, or false if they cannot (i.e., the terrain is not traversable, the cell is occupied, etc.)
   *
   * Cells with no data are considered non-traversable.
   */
  public isTraversable (x: number, y: number): boolean {
    const cell = this._getCell(x, y)
    return cell?.terrain?.traversable && cell?.creatureId === undefined
  }

  /**
   * Gets the ID of the creature in the specified map cell, or undefined if there is no cell with
   * a creature at those coordinates.
   */
  public getCreatureId (x: number, y: number): number | undefined {
    return this._getCell(x, y)?.creatureId
  }

  /**
   * Sets the creature ID for a specified map cell.
   */
  public setCreatureId (x: number, y: number, creatureId: number | undefined) {
    this._getCell(x, y, true).creatureId = creatureId
  }

  /**
   * Removes the specified creature from the map.
   */
  public removeCreature (creature: Creature) {
    const cell = this._getCell(creature.x, creature.y)
    if (cell.creatureId === creature.id) {
      this.setCreatureId(creature.x, creature.y, undefined)
    }
  }

  /**
   * Updates the terrain for a given map cell. Will create the cell if it does not yet exist.
   */
  public setTerrain (x: number, y: number, terrain: TerrainType) {
    this._getCell(x, y, true).terrain = terrain
  }

  private _getCell (x: number, y: number, createIfMissing = false) {
    if (createIfMissing && this._cells[y] === undefined) {
      this._cells[y] = []
    }

    if (createIfMissing && this._cells[y][x] === undefined) {
      this._cells[y][x] = { terrain: Terrain.Default }
    }

    return this._cells[y]?.[x]
  }
}

export const selectOffsetX = selector({
  key: 'mapOffsetX',
  get: ({ get }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const player = get(playerState)
    return -20 // player.x
  },
})

export const selectOffsetY = selector({
  key: 'mapOffsetY',
  get: ({ get }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const player = get(playerState)
    return -20 // player.y
  },
})
