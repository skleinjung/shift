import { Creature } from 'engine/creature'
import { CellCoordinate, MapCell } from 'engine/map/map'
import { MapSymbol } from 'engine/map/map-symbol'
import { getCreatureSymbol, getItemSymbol, getTerrainSymbol, withDefaultBackground } from 'engine/map/map-symbolizer'
import { isTileVisibleTo } from 'engine/scripts/tile-visibility-sensor'
import { World } from 'engine/world'
import { compact, forEach, get, keys, map as lodashMap, values, without } from 'lodash/fp'
import * as PIXI from 'pixi.js'
import { FontNames } from 'ui/fonts'
import { damaged, HighlightEffect, missed } from 'ui/visual-effects/highlights'

abstract class AbstractTile {
  protected background: PIXI.Sprite
  protected container: PIXI.Container
  protected highlightEffect: HighlightEffect | undefined
  protected symbol: PIXI.BitmapText

  /** boolean indicating if this tile is viewable in the viewport */
  private _inFrame = true

  constructor (
    protected world: World,
    protected cellWidth: number,
    protected cellHeight: number,
    backgroundTexture: PIXI.Texture
  ) {
    this.background = new PIXI.Sprite(backgroundTexture)

    this.symbol = new PIXI.BitmapText(' ', { fontName: FontNames.Map })
    this.symbol.anchor.set(0.5)
    this.symbol.position.set(cellWidth / 2, cellHeight / 2 - 2)

    this.container = new PIXI.Container()
    this.container.addChild(this.background)
    this.container.addChild(this.symbol)
  }

  /** boolean indicating if this tile is viewable in the viewport */
  public get inFrame (): boolean {
    return this._inFrame
  }

  /** boolean indicating if this tile is viewable in the viewport */
  public set inFrame (inFrame: boolean) {
    this.container.visible = inFrame
    this._inFrame = inFrame
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

  public removeFrom (container: PIXI.Container) {
    container.removeChild(this.container)
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
    cellHeight: number,
    backgroundTexture: PIXI.Texture
  ) {
    super(world, cellWidth, cellHeight, backgroundTexture)
    this.update()

    this._creature.on('defend', () => {
      this.highlight(missed())
    })
    this._creature.on('damaged', ({ amount }) => {
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
    public readonly x: number,
    public readonly y: number,
    private _cell: MapCell,
    cellWidth: number,
    cellHeight: number,
    backgroundTexture: PIXI.Texture
  ) {
    super(world, cellWidth, cellHeight, backgroundTexture)
  }

  public update () {
    this.container.position.set(this.x * this.cellWidth, this.y * this.cellHeight)

    if (this._cell.items.length > 0) {
      this.setMapSymbol(withDefaultBackground(this._cell, getItemSymbol(this._cell.items)))
    } else {
      this.setMapSymbol(getTerrainSymbol(this._cell.terrain))
    }
  }
}

export class MapSceneGraph {
  private _root: PIXI.Container
  private _mapCellsContainer: PIXI.Container
  private _creaturesContainer: PIXI.Container

  private _cellHighlight: PIXI.Graphics | undefined
  private _creatureTiles: { [k in string]: CreatureTile } = {}
  private _mapCellTiles: MapCellTile[][] = []
  private _allTiles: MapCellTile[] = []

  private _backgroundTexture

  constructor (
    app: PIXI.Application,
    private _cellWidth: number,
    private _cellHeight: number
  ) {
    this._root = new PIXI.Container()
    this._mapCellsContainer = new PIXI.Container()
    this._creaturesContainer = new PIXI.Container()

    this._root.addChild(this._mapCellsContainer)
    this._root.addChild(this._creaturesContainer)
    app.stage.addChild(this._root)

    const background = new PIXI.Graphics()
    background.beginFill(0xffffff)
    background.drawRect(0, 0, _cellWidth, _cellHeight)

    this._backgroundTexture = app.renderer.generateTexture(background)
  }

  /**
   * Sets or clears the currently 'focused' cell, which will be shown with a border
   * or other highlight effect.
   */
  public setCellFocus (coordinate: CellCoordinate | undefined) {
    if (coordinate === undefined) {
      if (this._cellHighlight !== undefined) {
        this._root.removeChild(this._cellHighlight)
        this._cellHighlight = undefined
      }
    } else {
      if (this._cellHighlight === undefined) {
        this._cellHighlight = new PIXI.Graphics()
        this._cellHighlight.lineStyle(1, 0xff0000, 0.66)
        this._cellHighlight.beginFill(0xff0000, 0.2)
        this._cellHighlight.drawRect(0, 0, this._cellWidth, this._cellHeight)

        this._root.addChild(this._cellHighlight)
      }

      this._cellHighlight.position.set(
        coordinate.x * this._cellWidth,
        coordinate.y * this._cellHeight
      )
    }
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

    // create any missing cells for newly visible tiles
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
            this._cellHeight,
            this._backgroundTexture
          )
          this._mapCellTiles[cellY][cellX].addTo(this._mapCellsContainer)
          this._allTiles.push(this._mapCellTiles[cellY][cellX])
        }
      }
    }

    // update visibility and status of map tiles
    forEach((tile) => {
      if (tile.x < xOffset ||
        tile.x > (xOffset + viewWidth + 1) ||
        tile.y < yOffset ||
        tile.y > (yOffset + viewHeight + 1) ||
        !isTileVisibleTo(world.player, tile.x, tile.y, world.map)
      ) {
        tile.inFrame = false
      } else {
        tile.update()
        tile.inFrame = true
      }
    }, this._allTiles)

    // TODO: use appropriate events from creatures instead of looping through this...
    const validKeys = lodashMap((id) => `${id}`, compact(lodashMap(get('id'), world.creatures)))
    const removedCreatureIds = without(validKeys, keys(this._creatureTiles))
    forEach((id) => {
      this._creatureTiles[id].removeFrom(this._creaturesContainer)
      delete this._creatureTiles[id]
    }, removedCreatureIds)

    // create any missing creature tiles
    for (const creature of world.creatures) {
      if (this._creatureTiles[creature.id] === undefined) {
        this._creatureTiles[creature.id] = new CreatureTile(
          world,
          creature,
          this._cellWidth,
          this._cellHeight,
          this._backgroundTexture
        )
        this._creatureTiles[creature.id].addTo(this._creaturesContainer)
      }
    }

    // update the creature tiles
    this.update()
  }

  /**
   * Perform strictly visual-only effect updates for creatures, during a PIXI ticker callback.
   */
  public update () {
    for (const tile of values(this._creatureTiles)) {
      tile.update()
    }
  }
}
