import { ShaderSystem } from '@pixi/core'
import { install } from '@pixi/unsafe-eval'
import { toSymbol } from 'engine/map/map-symbolizer'
import { isArray, noop } from 'lodash/fp'
import * as PIXI from 'pixi.js'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useWorld } from 'ui/hooks/use-world'

import { FontNames } from '../fonts'

import { Panel, PanelProps } from './panel'

// Apply the patch to PIXI
install({ ShaderSystem })

const CellFontSize = 28
const CellHeight = 28
const CellWidth = 28

interface RenderCell {
  background: PIXI.Graphics
  symbol: PIXI.BitmapText
}

interface ViewportSize {
  /** width of the viewport, in grid cells */
  width: number

  /** height of the viewport, in grid cells */
  height: number
}

export interface MapPanelProps extends Omit<PanelProps, 'columns' | 'rows'> {
  /** y-coordinate of the viewport center; (default: 0) */
  centerY?: number

  /** x-coordinate of the viewport center; (default: 0) */
  centerX?: number

  /** optional callback that is notified whenever the user clicks on the map */
  onMapClick?: (mapX: number, mapY: number) => void

  /** callback notified whenever the size of the viewport changes, with new dimensions in map cell coordinates */
  onViewportSizeChanged?: (width: number, height: number) => void
}

/**
 * Ensure that there are enough render cells created for a viewport with the given dimensions (in map coordinates,
 * not pixels). If the current cells array is smaller than the requested dimensions, new cells will be created and
 * added to the PIXI app as needed.
 *
 * TODO: remove cells that are no longer needed if the dimensions shrink
 */
const initializeRenderCells = (app: PIXI.Application, cells: RenderCell[][], gridWidth: number, gridHeight: number) => {
  const rectangle = new PIXI.Graphics()
  rectangle.beginFill(0xffffff)
  rectangle.drawRect(0, 0, CellWidth, CellHeight)

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

export const MapPanel = ({
  centerX = 0,
  centerY = 0,
  onMapClick = noop,
  onViewportSizeChanged = noop,
  ...panelProps
}: MapPanelProps) => {
  const world = useWorld()
  const timeSinceScrollRef = useRef<number>(0)
  const mapCellsRef = useRef<RenderCell[][]>([])

  const resizeObserverRef = useRef<ResizeObserver | null>()
  const [viewportSize, setViewportSize] = useState<ViewportSize | undefined>()
  const offsetXRef = useRef(0)
  const offsetYRef = useRef(0)

  if (viewportSize !== undefined) {
    // -1 in both of these calculations is to account for the row/column we are centering
    offsetXRef.current = Math.floor(centerX - ((viewportSize.width - 1) / 2))
    offsetYRef.current = Math.floor(centerY - ((viewportSize.height - 1) / 2))
  }

  const appRef = useRef<PIXI.Application | null>(null)

  // create PIXI objects for new cells if the viewport has expanded
  useEffect(() => {
    if (appRef.current !== null && viewportSize !== undefined) {
      const cells = mapCellsRef.current
      initializeRenderCells(appRef.current, cells, viewportSize.width, viewportSize.height)
      onViewportSizeChanged(viewportSize.width, viewportSize.height)
    }
  }, [onViewportSizeChanged, viewportSize])

  // update cell contents on every render
  useEffect(() => {
    if (appRef.current !== null && viewportSize !== undefined) {
      const cells = mapCellsRef.current

      if (cells[0] !== undefined) {
        for (let y = 0; y < cells.length; y++) {
          for (let x = 0; x < cells[y].length; x++) {
            const mapX = x + offsetXRef.current
            const mapY = y + offsetYRef.current

            const mapSymbol = toSymbol(world.map.getCell(mapX, mapY))
            cells[y][x].background.tint = mapSymbol.background ?? 0
            cells[y][x].symbol.text = mapSymbol.symbol
            cells[y][x].symbol.tint = mapSymbol.color
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

      const newWidth = Math.floor(size.inlineSize / CellWidth)
      const newHeight = Math.floor(size.blockSize / CellHeight)

      setViewportSize({
        height: newHeight,
        width: newWidth,
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

  const handleClick = useCallback((event: React.MouseEvent) => {
    const mapX = Math.floor((event.clientX / CellWidth) + offsetXRef.current) - 1
    const mapY = Math.floor((event.clientY / CellHeight) + offsetYRef.current) - 1
    onMapClick(mapX, mapY)
  }, [onMapClick])

  return (<>
    <Panel {...panelProps}>
      <div
        className="map-canvas"
        onClick={handleClick}
        style={{ flex: 1, height: '100%' }}
        ref={pixiRefCallback}
      />
    </Panel>
  </>)
}
