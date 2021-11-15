import { BasicContainer } from 'engine/container'
import { Creature } from 'engine/creature'
import { Item } from 'engine/item'
import { TerrainType, TerrainTypes } from 'engine/terrain-db'
import { keys, stubTrue } from 'lodash'
import { filter, findIndex } from 'lodash/fp'
import { manhattanDistance } from 'math'

import { aStar } from './a-star'
import { getAdjacentCoordinates } from './map-utils'
import { PathCostFunction, uniformCost } from './path-cost-functions'

export type CellCoordinate = {
  x: number
  y: number
}

export interface PathFindingOptions {
  /** function used to calculate the relative costs of moving between two cells. (default = all cells cost '1') */
  costFunction?: PathCostFunction
}

export class MapCell extends BasicContainer {
  constructor (
    /** x coordinate of the cell */
    public x: number,
    /** y coordinate of the cell */
    public y: number,
    /** type of terrain in this cell */
    public terrain: TerrainType,
    /** ID of the creature occupying this cell, if any */
    public creature?: Creature
  ) {
    super()
  }
}

export class ExpeditionMap {
  private _defaultTerrain = TerrainTypes.default

  private _cells: MapCell[][] = []

  public get DefaultTerrain () {
    return this._defaultTerrain
  }

  public set DefaultTerrain (terrain: TerrainType) {
    this._defaultTerrain = terrain
  }

  public getCell (x: number, y: number): MapCell {
    return this._getCell(x, y, true)
  }

  /** Returns true if the (sparse) map has a cell at the given coordinates already. */
  public hasCell (x: number, y: number): boolean {
    return this._getCell(x, y) !== undefined
  }

  /**
   * Returns an array containing all of the map cells that have been populated (i.e., excluding the virtual
   * "default" cells.) If the optional predicate is supplied, the list will be filtered to include only
   * cells for which the predicate returns true.
   */
  public getCells (predicate: (cell: MapCell) => boolean = stubTrue): MapCell[] {
    const results = []
    for (const row of keys(this._cells)) {
      const x = parseInt(row)

      if (this._cells[x] === undefined) {
        continue
      }

      for (const column of keys(this._cells[x])) {
        const y = parseInt(column)

        const cell = this._cells[x][y]
        if (cell === undefined) {
          continue
        }

        if (predicate(cell)) {
          results.push(cell)
        }
      }
    }

    return results
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
      cell.addItem(item)
    }
  }

  /**
   * Removes an item from the ground at the specified cell coordinates.
   */
  public removeItem (x: number, y: number, item: Item) {
    const cell = this._getCell(x, y)
    if (cell !== undefined) {
      cell.removeItem(item)
    }
  }

  /**
   * Returns a list of items in the specified map cell.
   */
  public getItems (x: number, y: number) {
    return this._getCell(x, y)?.items ?? []
  }

  /**
   * Returns a list of items in the given cell that have any available item interactions. If the
   * interactionName parameter is specified, then only items that support that type of interaction
   * are returned.
   */
  public getInteractableItems (x: number, y: number, interactionName?: string) {
    return filter((item) => {
      return interactionName === undefined
        ? item.interactions.length > 1
        : item.getInteraction(interactionName) !== undefined
    }, this.getItems(x, y))
  }

  /**
   * Gets the terrain type for the specified cell.
   */
  public getTerrain (x: number, y: number) {
    return this._getCell(x, y)?.terrain ?? this._defaultTerrain
  }

  /**
   * Calculates the shortest path between two map cells. Returns an array of each cell in the path,
   * including the start and goal cells. If there is no valid path, an empty array will be returned.
   * If the start and goal are the same, then the array will contain a single item -- the shared
   * start/goal cell.
   */
  public getPath (
    start: CellCoordinate,
    goal: CellCoordinate,
    { costFunction = uniformCost }: PathFindingOptions = {}
  ): CellCoordinate[] {
    return aStar({
      distance: costFunction,
      getNeighbors: this._getTraversableNeighbors.bind(this),
      goal,
      heuristic: manhattanDistance,
      start,
    })
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
      this._cells[y][x] = new MapCell(x, y, this._defaultTerrain)
    }

    return this._cells[y]?.[x]
  }

  private _getTraversableNeighbors (cell: CellCoordinate) {
    const possibilities = getAdjacentCoordinates(cell)
    return filter(({ x, y }) => this.getTerrain(x, y).traversable, possibilities)
  }
}
