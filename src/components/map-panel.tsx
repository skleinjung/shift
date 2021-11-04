/* eslint-disable @typescript-eslint/no-unused-vars */
import { ShaderSystem } from '@pixi/core'
import { install } from '@pixi/unsafe-eval'
import { Terrain } from 'db/terrain'
import { FontNames } from 'fonts'
import { isArray } from 'lodash/fp'
import * as PIXI from 'pixi.js'
import { useCallback, useEffect, useRef, useState } from 'react'
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

interface ViewportSize {
  width: number
  height: number
}

export interface MapPanelProps {
  /** the whole world */
  world: World
}

/**
 * Ensure that there are enough render cells created for a viewport with the given dimensions. If the current
 * cells array is smaller than the requested dimensions, new cells will be created and added to the PIXI app
 * as needed.
 *
 * TODO: remove cells that are no longer needed if the dimensions shrink
 */
const initializeRenderCells = (app: PIXI.Application, cells: RenderCell[][], width: number, height: number) => {
  const rectangle = new PIXI.Graphics()
  rectangle.beginFill(0xffffff)
  rectangle.drawRect(0, 0, CellWidth, CellHeight)

  const gridHeight = height / CellHeight
  const gridWidth = width / CellWidth

  for (let y = 0; y < gridHeight; y++) {
    if (cells[y] === undefined) {
      cells[y] = []
    }

    for (let x = cells[y].length; x < gridWidth; x++) {
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
}

export const MapPanel = ({ world }: MapPanelProps) => {
  const timeSinceScrollRef = useRef<number>(0)
  const mapCellsRef = useRef<RenderCell[][]>([])
  const resizeObserverRef = useRef<ResizeObserver | null>()
  const [viewportSize, setViewportSize] = useState<ViewportSize | undefined>()

  // making the map immutable was too much of a performance hit, so we access a global
  // something else must notify us of map changes, then
  const offsetX = -20
  const offsetY = -20
  // we only subscribe to player because it's the easiest way to rerender currently
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [player, updatePlayer] = useRecoilState(playerState)
  const appRef = useRef<PIXI.Application | null>(null)

  // create PIXI objects for new cells if the viewport has expanded
  useEffect(() => {
    if (appRef.current !== null && viewportSize !== undefined) {
      const cells = mapCellsRef.current
      initializeRenderCells(appRef.current, cells, viewportSize?.width, viewportSize?.height)
    }
  }, [viewportSize])

  // update cell contents on every render
  useEffect(() => {
    if (appRef.current !== null && viewportSize !== undefined) {
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
    }
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

    appRef.current = app
  }, [])

  const initializeResizeListener = useCallback((container: HTMLDivElement) => {
    resizeObserverRef.current = new ResizeObserver((entries) => {
      const contentBox = entries[0].contentBoxSize

      // Firefox implements `contentBoxSize` as a single content rect, rather than an array
      // See: https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver
      const size = (isArray(contentBox) ? contentBox[0] : contentBox) as any as ResizeObserverSize

      setViewportSize({
        height: size.blockSize,
        width: size.inlineSize,
      })
    })
    resizeObserverRef.current.observe(container)
  }, [])

  const pixiRefCallback = useCallback((container: HTMLDivElement) => {
    if (container === null) {
      // destroy any pre-existing Pixi app
      if (appRef.current !== null) {
        appRef.current.destroy(true)
        appRef.current = null
      }

      if (resizeObserverRef.current !== null) {
        resizeObserverRef.current?.disconnect()
        resizeObserverRef.current = null
      }
    } else {
      // if our ref is set, initialize the app
      initializePixiApp(container)
      initializeResizeListener(container)
    }
  }, [initializePixiApp, initializeResizeListener])

  return (<>
    <Panel>
      <div style={{ flex: 1, height: '100%' }} ref={pixiRefCallback} />
    </Panel>
  </>)
}
