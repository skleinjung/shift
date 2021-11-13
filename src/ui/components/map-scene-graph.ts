import { Creature } from 'engine/creature'
import { MapCell } from 'engine/map/map'
import { MapSymbol } from 'engine/map/map-symbol'
import { getCreatureSymbol, getItemSymbol, getTerrainSymbol, withDefaultBackground } from 'engine/map/map-symbolizer'
import { World } from 'engine/world'
import * as PIXI from 'pixi.js'
import { FontNames } from 'ui/fonts'

abstract class AbstractTile {
  protected container: PIXI.Container
  protected background: PIXI.Graphics
  protected symbol: PIXI.BitmapText

  constructor (
    protected cellWidth: number,
    protected cellHeight: number
  ) {
    this.background = new PIXI.Graphics()
    this.background.beginFill(0xffffff)
    this.background.drawRect(0, 0, cellWidth, cellHeight)

    this.symbol = new PIXI.BitmapText(' ', { fontName: FontNames.Map })
    this.symbol.anchor.set(0.5)
    this.symbol.position.set(cellWidth / 2, cellHeight / 2 - 2)

    this.container = new PIXI.Container()
    this.container.addChild(this.background)
    this.container.addChild(this.symbol)
  }

  protected setMapSymbol (symbol: MapSymbol) {
    this.symbol.text = symbol.symbol
    this.symbol.tint = symbol.color
    this.background.tint = symbol.background ?? 0x0
  }

  public addTo (container: PIXI.Container) {
    if (this.container.parent) {
      this.container.parent.removeChild(this.container)
    }

    container.addChild(this.container)
  }

  public setVisible (visible: boolean) {
    this.container.visible = visible
  }
}

class CreatureTile extends AbstractTile {
  constructor (
    private _creature: Creature,
    cellWidth: number,
    cellHeight: number
  ) {
    super(cellWidth, cellHeight)
    this.update()
  }

  public update () {
    this.setMapSymbol(getCreatureSymbol(this._creature))
    this.container.position.set(this._creature.x * this.cellWidth, this._creature.y * this.cellHeight)

    this.setVisible(!this._creature.dead)

    if (this._creature.dead) {
      this.symbol.text = '!'
    }
  }
}

class MapCellTile extends AbstractTile {
  constructor (
    private _x: number,
    private _y: number,
    private _cell: MapCell,
    cellWidth: number,
    cellHeight: number
  ) {
    super(cellWidth, cellHeight)
    this.update()
  }

  public update () {
    this.container.position.set(this._x * this.cellWidth, this._y * this.cellHeight)

    // hide ourselves if a creature is here, it's rendering takes precendence
    this.setVisible(this._cell.creature === undefined)

    if (this._cell.items.length > 0) {
      this.setMapSymbol(withDefaultBackground(this._cell, getItemSymbol(this._cell.items)))
    } else {
      this.setMapSymbol(getTerrainSymbol(this._cell.terrain))
    }
  }
}

export class MapSceneGraph {
  private _root: PIXI.Container
  private _creatureTiles: CreatureTile[] = []
  private _mapCellTiles: MapCellTile[][] = []

  constructor (
    app: PIXI.Application,
    private _cellWidth: number,
    private _cellHeight: number
  ) {
    this._root = new PIXI.Container()
    app.stage.addChild(this._root)
  }

  public setOffset (cellX: number, cellY: number) {
    this._root.setTransform(-cellX * this._cellWidth, -cellY * this._cellHeight)
  }

  /**
   * Update all creature tiles, and map cell tiles inside the specified rectangle
   */
  public update (world: World, xOffset: number, yOffset: number, viewWidth: number, viewHeight: number) {
    this.setOffset(xOffset, yOffset)

    const map = world.map

    for (let cellY = xOffset; cellY < yOffset + viewHeight; cellY++) {
      for (let cellX = xOffset; cellX < xOffset + viewWidth; cellX++) {
        if (this._mapCellTiles[cellY] === undefined) {
          this._mapCellTiles[cellY] = []
        }

        if (this._mapCellTiles[cellY][cellX] === undefined) {
          const cell = map.getCell(cellX, cellY)
          this._mapCellTiles[cellY][cellX] = new MapCellTile(cellX, cellY, cell, this._cellWidth, this._cellHeight)
          this._mapCellTiles[cellY][cellX].addTo(this._root)
        } else {
          this._mapCellTiles[cellY][cellX].update()
        }
      }
    }

    // create any missing tiles
    for (const creature of world.creatures) {
      if (this._creatureTiles[creature.id] === undefined) {
        this._creatureTiles[creature.id] = new CreatureTile(creature, this._cellWidth, this._cellHeight)
        this._creatureTiles[creature.id].addTo(this._root)
      }
    }

    // update the creature tiles
    for (const tile of this._creatureTiles) {
      if (tile) {
        tile.update()
      }
    }
  }
}
