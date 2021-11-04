import { ShaderSystem } from '@pixi/core'
import { install } from '@pixi/unsafe-eval'
import { FontNames } from 'fonts'
import * as PIXI from 'pixi.js'
import { useCallback, useEffect, useRef } from 'react'
import { useRecoilValue } from 'recoil'
import { MapCell, mapState, selectOffsetX, selectOffsetY, Terrain } from 'state/map'

import { Panel } from './panel'

// Apply the patch to PIXI
install({ ShaderSystem })

const CellFontSize = 16
const CellHeight = CellFontSize
const CellWidth = 12

const getBackgroundAt = (map: MapCell[][], x: number, y: number) =>
  (map[y]?.[x]?.terrain ?? Terrain.Default).background

const getColorAt = (map: MapCell[][], x: number, y: number) =>
  (map[y]?.[x]?.terrain ?? Terrain.Default).color

const getSymbolAt = (map: MapCell[][], x: number, y: number) =>
  (map[y]?.[x]?.terrain ?? Terrain.Default).symbol

interface RenderCell {
  background: PIXI.Graphics
  symbol: PIXI.BitmapText
}

export const MapPanel = () => {
  const timeSinceScrollRef = useRef<number>(0)
  const mapCellsRef = useRef<RenderCell[][]>([])
  const map = useRecoilValue(mapState)
  const offsetX = useRecoilValue(selectOffsetX)
  const offsetY = useRecoilValue(selectOffsetY)

  const appRef = useRef<PIXI.Application | null>(null)

  useEffect(() => {
    const cells = mapCellsRef.current

    if (cells[0] !== undefined) {
      for (let y = 0; y < cells.length; y++) {
        for (let x = 0; x < cells[y].length; x++) {
          const mapX = x + offsetX
          const mapY = y + offsetY

          cells[y][x].background.tint = getBackgroundAt(map, mapX, mapY)
          cells[y][x].symbol.text = getSymbolAt(map, mapX, mapY)
          cells[y][x].symbol.tint = getColorAt(map, mapX, mapY)
        }
      }
    }
    timeSinceScrollRef.current -= (1000 / 100)
  }, [map, offsetX, offsetY])

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
        symbol.position.set(x * CellWidth + (CellWidth / 2), y * CellHeight + (CellHeight / 2))
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
