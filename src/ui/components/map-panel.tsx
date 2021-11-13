import { ShaderSystem } from '@pixi/core'
import { install } from '@pixi/unsafe-eval'
import { isArray, noop } from 'lodash/fp'
import * as PIXI from 'pixi.js'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useWorld } from 'ui/hooks/use-world'

import { FontNames } from '../fonts'

import { MapSceneGraph } from './map-scene-graph'
import { Panel, PanelProps } from './panel'

// Apply the patch to PIXI
install({ ShaderSystem })

const CellFontSize = 28
const CellHeight = 28
const CellWidth = 28

interface ViewportSize {
  /** width of the viewport, in grid cells */
  width: number

  /** height of the viewport, in grid cells */
  height: number
}

export interface MapPanelProps extends Omit<PanelProps, 'columns' | 'rows'> {
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
  onMapClick = noop,
  onViewportSizeChanged = noop,
  ...panelProps
}: MapPanelProps) => {
  const world = useWorld()
  const sceneGraphRef = useRef<MapSceneGraph | undefined>()

  const resizeObserverRef = useRef<ResizeObserver | null>()
  const [viewportSize, setViewportSize] = useState<ViewportSize | undefined>()
  const centerXRef = useRef(0)
  const centerYRef = useRef(0)
  const offsetXRef = useRef(0)
  const offsetYRef = useRef(0)

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

  // update cell contents on every render
  useEffect(() => {
    if (sceneGraphRef.current && viewportSize !== undefined) {
      sceneGraphRef.current.update(
        world,
        offsetXRef.current,
        offsetYRef.current,
        viewportSize.width,
        viewportSize.height
      )
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
