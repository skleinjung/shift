import { ShaderSystem } from '@pixi/core'
import { install } from '@pixi/unsafe-eval'
import { CellCoordinate } from 'engine/map/map'
import { isArray, noop } from 'lodash/fp'
import * as PIXI from 'pixi.js'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useGame } from 'ui/hooks/use-game'
import { useWorld } from 'ui/hooks/use-world'

import { FontNames } from '../fonts'

import { MapSceneGraph } from './map-scene-graph'
import { Panel, PanelProps } from './panel'

// Apply the patch to PIXI
install({ ShaderSystem })

const CellFontSize = 21
const CellHeight = 21
const CellWidth = 21

interface ViewportSize {
  /** width of the viewport, in grid cells */
  width: number

  /** height of the viewport, in grid cells */
  height: number
}

export interface MapPanelProps extends Omit<PanelProps, 'columns' | 'rows'> {
  /** (x, y) coordinate of the cell to highlight, if any */
  focusedCell?: CellCoordinate

  /** optional callback that is notified when the user moves the mouse over a cell on the map */
  onCellFocus?: (cell: CellCoordinate | undefined) => void

  /** optional callback that is notified whenever the user clicks on the map */
  onMapClick?: (mapX: number, mapY: number) => void

  /** callback notified whenever the size of the viewport changes, with new dimensions in map cell coordinates */
  onViewportSizeChanged?: (width: number, height: number) => void
}

const calculateViewportCenter = (
  width: number,
  height: number,
  oldCenterX: number,
  oldCenterY: number,
  playerX: number,
  playerY: number
): { x: number; y: number } => {
  const SMALL_MAP_THRESHOLD = 15
  const SCROLL_THRESHOLD_PERCENT = 0.40

  if (width > SMALL_MAP_THRESHOLD && height > SMALL_MAP_THRESHOLD) {
    const left = Math.floor(oldCenterX - (width / 2))
    const right = Math.floor(oldCenterX + (width / 2) - 1)
    const top = Math.floor(oldCenterY - (height / 2))
    const bottom = Math.floor(oldCenterY + (height / 2) - 1)

    const minPeekColumns = Math.max(5, Math.floor(SCROLL_THRESHOLD_PERCENT * width))
    const minPeekRows = Math.max(5, Math.floor(SCROLL_THRESHOLD_PERCENT * height))

    const leftAdjust = Math.min(0, playerX - (left + minPeekColumns))
    const rightAdjust = Math.max(0, playerX - (right - minPeekColumns))
    const horizontalAdjust = leftAdjust !== 0 ? leftAdjust : rightAdjust

    const upAdjust = Math.min(0, playerY - (top + minPeekRows - 1))
    const downAdjust = Math.max(0, playerY - (bottom - minPeekRows + 1))
    const verticalAdjust = upAdjust !== 0 ? upAdjust : downAdjust

    return {
      x: oldCenterX + horizontalAdjust,
      y: oldCenterY + verticalAdjust,
    }
  }

  // just always center small maps
  return { x: playerX, y: playerY }
}

export const MapPanel = ({
  focusedCell,
  onCellFocus = noop,
  onMapClick = noop,
  onViewportSizeChanged = noop,
  ...panelProps
}: MapPanelProps) => {
  const game = useGame()
  const world = useWorld()
  const sceneGraphRef = useRef<MapSceneGraph | undefined>()

  const resizeObserverRef = useRef<ResizeObserver | null>()
  const [viewportSize, setViewportSize] = useState<ViewportSize | undefined>()
  const centerXRef = useRef(0)
  const centerYRef = useRef(0)
  const offsetXRef = useRef(0)
  const offsetYRef = useRef(0)

  // we store the most recent mouse coordinates in a ref, so if the viepwort
  // moves we can notify the onCellFocus callback
  const mouseRef = useRef<{x: number; y: number} | undefined>()
  const lastFocusedCellRef = useRef<CellCoordinate | undefined>()

  if (viewportSize !== undefined) {
    const { x, y } = calculateViewportCenter(
      viewportSize.width,
      viewportSize.height,
      centerXRef.current,
      centerYRef.current,
      world.player.x,
      world.player.y
    )

    centerXRef.current = x
    centerYRef.current = y
  }

  const centerX = centerXRef.current
  const centerY = centerYRef.current

  if (viewportSize !== undefined) {
    // -1 in both of these calculations is to account for the row/column we are centering
    offsetXRef.current = Math.floor(centerX - ((viewportSize.width - 1) / 2))
    offsetYRef.current = Math.floor(centerY - ((viewportSize.height - 1) / 2))
  }

  const appRef = useRef<PIXI.Application | null>(null)

  // create PIXI objects for new cells if the viewport has expanded
  useEffect(() => {
    if (appRef.current !== null && viewportSize !== undefined) {
      onViewportSizeChanged(viewportSize.width, viewportSize.height)
    }
  }, [onViewportSizeChanged, viewportSize])

  // listen for when new world are ready, and recreate our scene graph tiles
  useEffect(() => {
    const worldChangeHandler = () => {
      sceneGraphRef.current?.onWorldChange()
    }

    game.on('worldChange', worldChangeHandler)
    return () => {
      game.off('worldChange', worldChangeHandler)
    }
  }, [game])

  // update cell contents on every render (when the world is updated)
  useEffect(() => {
    if (sceneGraphRef.current && viewportSize !== undefined) {
      sceneGraphRef.current.onWorldUpdate(
        world,
        offsetXRef.current,
        offsetYRef.current,
        viewportSize.width,
        viewportSize.height
      )

      sceneGraphRef.current.setCellFocus(focusedCell)

      if (mouseRef.current !== undefined) {
        // If the mouse is in our bounds, check if a new cell has been focused
        // due to the viewport scrolling. If so, notify our callback
        const newFocusCell = convertMouseCoordinatesToCell(mouseRef.current.x, mouseRef.current.y)
        if (newFocusCell.x !== lastFocusedCellRef.current?.x || newFocusCell.y !== lastFocusedCellRef.current?.y) {
          lastFocusedCellRef.current = newFocusCell
          onCellFocus(newFocusCell)
        }
      }
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

    sceneGraphRef.current = new MapSceneGraph(app, CellWidth, CellHeight)
    app.ticker.add((_delta) => {
      if (sceneGraphRef.current) {
        sceneGraphRef.current.update()
      }
    })

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

  const convertMouseCoordinatesToCell = useCallback((mouseX: number, mouseY: number) => {
    return {
      x: Math.floor((mouseX / CellWidth) + offsetXRef.current - 0.5) - 1,
      y: Math.floor((mouseY / CellHeight) + offsetYRef.current - 0.5) - 1,
    }
  }, [])

  const handleClick = useCallback((event: React.MouseEvent) => {
    const { x, y } = convertMouseCoordinatesToCell(event.clientX, event.clientY)
    onMapClick(x, y)
  }, [convertMouseCoordinatesToCell, onMapClick])

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    const focusedCell = convertMouseCoordinatesToCell(event.clientX, event.clientY)

    mouseRef.current = { x: event.clientX, y: event.clientY }
    lastFocusedCellRef.current = focusedCell
    onCellFocus(focusedCell)
  }, [convertMouseCoordinatesToCell, onCellFocus])

  const handleMouseOut = useCallback(() => {
    mouseRef.current = undefined
    lastFocusedCellRef.current = undefined
    onCellFocus(undefined)
  }, [onCellFocus])

  return (<>
    <Panel {...panelProps}>
      <div
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseOut={handleMouseOut}
        style={{ flex: 1, height: '100%' }}
        ref={pixiRefCallback}
      />
    </Panel>
  </>)
}
