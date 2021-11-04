import { ShaderSystem } from '@pixi/core'
import { install } from '@pixi/unsafe-eval'
import { Terrain } from 'db/terrain'
import { FontNames } from 'fonts'
import * as PIXI from 'pixi.js'
import { useCallback, useEffect, useRef } from 'react'
import { useRecoilState } from 'recoil'
import { playerState } from 'state/player'
import { World } from 'world/world'

import { Panel } from './panel'

// Apply the patch to PIXI
install({ ShaderSystem })

const CellFontSize = 16
const CellHeight = 16
const CellWidth = 16

const getRenderable = (world: World, x: number, y: number) => {
  const cell = world.map.getCell(x, y)
  if (cell?.creatureId !== undefined) {
    return world.getCreature(cell.creatureId).type
  }

  return cell?.terrain !== undefined
    ? cell.terrain
    : Terrain.Default
}

const getBackgroundAt = (world: World, x: number, y: number) =>
  getRenderable(world, x, y).background ?? 0

const getColorAt = (world: World, x: number, y: number) =>
  getRenderable(world, x, y).color

const getSymbolAt = (world: World, x: number, y: number) =>
  getRenderable(world, x, y).symbol

interface RenderCell {
  background: PIXI.Graphics
  symbol: PIXI.BitmapText
}

export interface MapPanelProps {
  /** the whole world */
  world: World
}

export const MapPanel = ({ world }: MapPanelProps) => {
  const timeSinceScrollRef = useRef<number>(0)
  const mapCellsRef = useRef<RenderCell[][]>([])
  // making the map immutable was too much of a performance hit, so we access a global
  // something else must notify us of map changes, then
  const offsetX = -20
  const offsetY = -20
  // we only subscribe to player because it's the easiest way to rerender currently
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [player, updatePlayer] = useRecoilState(playerState)
  const appRef = useRef<PIXI.Application | null>(null)

  useEffect(() => {
    const cells = mapCellsRef.current

    if (cells[0] !== undefined) {
      for (let y = 0; y < cells.length; y++) {
        for (let x = 0; x < cells[y].length; x++) {
          const mapX = x + offsetX
          const mapY = y + offsetY

          cells[y][x].background.tint = getBackgroundAt(world, mapX, mapY)
          cells[y][x].symbol.text = getSymbolAt(world, mapX, mapY)
          cells[y][x].symbol.tint = getColorAt(world, mapX, mapY)
        }
      }
    }
    timeSinceScrollRef.current -= (1000 / 100)
  })

  const initializePixiApp = useCallback((container: HTMLDivElement) => {
    const app = new PIXI.Application({
      backgroundColor: 0x000000,
      resizeTo: container,
    })

    // Add app to DOM
    container.appendChild(app.view)
    app.start()

    PIXI.BitmapFont.from(
      FontNames.Map,
      {
        fill: '#ffffff',
        fontSize: CellFontSize,
        fontWeight: 'bold',
        dropShadow: false,
      },
      {
        chars: PIXI.BitmapFont.ASCII,
      }
    )

    const rectangle = new PIXI.Graphics()
    rectangle.beginFill(0xffffff)
    rectangle.drawRect(0, 0, CellWidth, CellHeight)

    const cells = mapCellsRef.current
    for (let y = 0; y < 88; y++) {
      cells[y] = []

      for (let x = 0; x < 150; x++) {
        const background = new PIXI.Graphics(rectangle.geometry)
        background.position.set(x * CellWidth, y * CellHeight)
        app.stage.addChild(background)

        const symbol = new PIXI.BitmapText(' ', { fontName: FontNames.Map })
        symbol.anchor.set(0.5)
        symbol.position.set(x * CellWidth + (CellWidth / 2), y * CellHeight + (CellHeight / 2) - 2)
        app.stage.addChild(symbol)

        cells[y][x] = {
          background,
          symbol,
        }
      }
    }

    appRef.current = app
  }, [])

  const pixiRefCallback = useCallback((container: HTMLDivElement) => {
    if (container === null) {
      // destroy any pre-existing Pixi app
      if (appRef.current !== null) {
        appRef.current.destroy(true)
      }
    } else {
      // if our ref is set, initialize the app
      initializePixiApp(container)
    }
  }, [initializePixiApp])

  return (<>
    <Panel>
      <div style={{ flex: 1, height: '100%' }} ref={pixiRefCallback} />
    </Panel>
  </>)
}
