import { findIndex } from 'lodash/fp'
import { selector } from 'recoil'
import { playerState } from 'ui/state/player'

import { Creature } from './creature'
import { Item } from './item'
import { TerrainType, TerrainTypes } from './terrain-db'

export interface MapCell {
  /** ID of the creature occupying this cell, if any */
  creature?: Creature

  /** list of items on the ground here, which may be empty */
  items: Item[]

  /** type of terrain in this cell */
  terrain: TerrainType
}

const DefaultCell: MapCell = {
  items: [],
  terrain: TerrainTypes.default,
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
    return cell?.terrain?.traversable && cell?.creature === undefined
  }

  /**
   * Gets the ID of the creature in the specified map cell, or undefined if there is no cell with
   * a creature at those coordinates.
   */
  public getCreature (x: number, y: number): Creature | undefined {
    return this._getCell(x, y)?.creature
  }

  /**
   * Sets the creature ID for a specified map cell.
   */
  public setCreature (x: number, y: number, creature: Creature | undefined) {
    this._getCell(x, y, true).creature = creature
  }

  /**
   * Removes the specified creature from the map.
   */
  public removeCreature (creature: Creature) {
    const cell = this._getCell(creature.x, creature.y)
    if (cell.creature?.id === creature.id) {
      this.setCreature(creature.x, creature.y, undefined)
    }
  }

  /**
   * Adds an item to the ground at the specified cell coordinates.
   */
  public addItem (x: number, y: number, item: Item) {
    const cell = this._getCell(x, y, true)
    if (findIndex((cellItem) => cellItem.id === item.id, cell.items) === -1) {
      cell.items.push(item)
    }
  }

  /**
   * Removes an item from the ground at the specified cell coordinates.
   */
  public removeItem (x: number, y: number, item: Item) {
    const cell = this._getCell(x, y)
    if (cell !== undefined) {
      const index = findIndex((cellItem) => cellItem.id === item.id, cell.items)
      if (index > -1) {
        cell.items.splice(index, 1)
      }
    }
  }

  /**
   * Gets the terrain type for the specified cell.
   */
  public getTerrain (x: number, y: number) {
    return this._getCell(x, y)?.terrain ?? TerrainTypes.default
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
      this._cells[y][x] = { items: [], terrain: TerrainTypes.default }
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
