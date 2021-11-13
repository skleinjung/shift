import { Creature } from 'engine/creature'
import { MapCell } from 'engine/map/map'
import { MapSymbol } from 'engine/map/map-symbol'
import { getCreatureSymbol, getItemSymbol, getTerrainSymbol, withDefaultBackground } from 'engine/map/map-symbolizer'
import { World } from 'engine/world'
import { compact } from 'lodash/fp'
import * as PIXI from 'pixi.js'
import { FontNames } from 'ui/fonts'
import { damaged, HighlightEffect, missed } from 'ui/visual-effects/highlights'

abstract class AbstractTile {
  protected background: PIXI.Graphics
  protected container: PIXI.Container
  protected highlightEffect: HighlightEffect | undefined
  protected symbol: PIXI.BitmapText

  constructor (
    protected world: World,
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

  public highlight (effect: HighlightEffect) {
    this.world.defer(effect.duration)
    this.highlightEffect = effect
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

  protected applyHighlight (defaultSymbol: MapSymbol) {
    if (this.highlightEffect?.complete) {
      this.highlightEffect = undefined
    }

    if (this.highlightEffect !== undefined) {
      const override = this.highlightEffect.getSymbol(defaultSymbol)
      this.setMapSymbol(override)
    }
  }
}

class CreatureTile extends AbstractTile {
  constructor (
    world: World,
    private _creature: Creature,
    cellWidth: number,
    cellHeight: number
  ) {
    super(world, cellWidth, cellHeight)
    this.update()

    this._creature.on('defend', () => {
      this.highlight(missed())
    })
    this._creature.on('damaged', (amount) => {
      this.highlight(damaged(amount > 9 ? '*' : `${amount}`))
    })
  }

  public update () {
    const symbol = getCreatureSymbol(this._creature)
    this.setMapSymbol(symbol)
    this.applyHighlight(symbol)

    this.container.position.set(this._creature.x * this.cellWidth, this._creature.y * this.cellHeight)
    this.setVisible(!this._creature.dead || this.highlightEffect !== undefined)
  }
}

class MapCellTile extends AbstractTile {
  constructor (
    world: World,
    private _x: number,
    private _y: number,
    private _cell: MapCell,
    cellWidth: number,
    cellHeight: number
  ) {
    super(world, cellWidth, cellHeight)
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
  public onWorldUpdate (world: World, xOffset: number, yOffset: number, viewWidth: number, viewHeight: number) {
    this.setOffset(xOffset, yOffset)

    const map = world.map

    for (let cellY = yOffset; cellY < yOffset + viewHeight; cellY++) {
      for (let cellX = xOffset; cellX < xOffset + viewWidth; cellX++) {
        if (this._mapCellTiles[cellY] === undefined) {
          this._mapCellTiles[cellY] = []
        }

        if (this._mapCellTiles[cellY][cellX] === undefined) {
          const cell = map.getCell(cellX, cellY)
          this._mapCellTiles[cellY][cellX] = new MapCellTile(
            world,
            cellX,
            cellY,
            cell,
            this._cellWidth,
            this._cellHeight
          )
          this._mapCellTiles[cellY][cellX].addTo(this._root)
        } else {
          this._mapCellTiles[cellY][cellX].update()
        }
      }
    }

    // create any missing tiles
    for (const creature of world.creatures) {
      if (this._creatureTiles[creature.id] === undefined) {
        this._creatureTiles[creature.id] = new CreatureTile(world, creature, this._cellWidth, this._cellHeight)
        this._creatureTiles[creature.id].addTo(this._root)
      }
    }

    // update the creature tiles
    for (const tile of compact(this._creatureTiles)) {
      tile.update()
    }
  }

  /**
   * Perform strictly visual-only effect updates for creatures, during a PIXI ticker callback.
   */
  public update (_elapsedFrames: number) {
    for (const tile of compact(this._creatureTiles)) {
      tile.update()
    }
  }
}
