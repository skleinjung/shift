import { ShaderSystem } from '@pixi/core'
import { install } from '@pixi/unsafe-eval'
import { FontNames } from 'fonts'
import { times } from 'lodash'
import * as PIXI from 'pixi.js'
import { useCallback, useRef } from 'react'
import { useRecoilCallback } from 'recoil'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { endTurn as endExpeditionTurn, expeditionState } from 'state/expedition'
import { gameState } from 'state/game'
import { getBackgroundAt, getColorAt, getSymbolAt, mapState } from 'state/map'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { dealDamage, endTurn, playerState } from 'state/player'

import { Panel } from './panel'

// Apply the patch to PIXI
install({ ShaderSystem })

const makeLine = (length: number) => {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }

  return result
}

const generateLines = () => {
  const result = [] as string[]
  times(5000, () => result.push(makeLine(5000)))
  return result
}

const lines = generateLines()

interface MapCell {
  background: PIXI.Graphics
  symbol: PIXI.BitmapText
}

interface RenderState {
  cells: MapCell[][]
  xOffset: number
  yOffset: number
}

export const MapPanel = () => {
  const timeSinceScrollRef = useRef<number>(0)
  const renderStateRef = useRef<RenderState>({
    cells: [],
    xOffset: -30,
    yOffset: -30,
  })

  const appRef = useRef<PIXI.Application | null>(null)

  const handleTick = useRecoilCallback(({ snapshot }) => (delta: number) => {
    const paused = snapshot.getLoadable(gameState).valueOrThrow().paused
    const map = snapshot.getLoadable(mapState).valueOrThrow()

    if (paused) {
      return
    }

    timeSinceScrollRef.current += delta

    if (timeSinceScrollRef.current < (1000 / 100)) {
      return
    }

    const renderState = renderStateRef.current
    const cells = renderState.cells

    // if (Math.random() * 100 < 20) {
    //   set(playerState, dealDamage(1))
    // }

    // set(playerState, endTurn)
    // set(expeditionState, endExpeditionTurn)

    if (cells[0] !== undefined) {
      for (let y = 0; y < cells.length; y++) {
        for (let x = 0; x < cells[y].length; x++) {
          const mapX = x + renderState.xOffset
          const mapY = y + renderState.yOffset

          cells[y][x].background.tint = getBackgroundAt(map, mapX, mapY)
          cells[y][x].symbol.text = getSymbolAt(map, mapX, mapY)
          cells[y][x].symbol.tint = getColorAt(map, mapX, mapY)
        }
      }
    }
    timeSinceScrollRef.current -= (1000 / 100)
  }, [])

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
        fontSize: 16,
        fontWeight: 'bold',
        dropShadow: false,
      },
      {
        chars: PIXI.BitmapFont.ASCII,
      }
    )

    const renderState = renderStateRef.current

    const rectangle = new PIXI.Graphics()
    rectangle.beginFill(0xffffff)
    rectangle.drawRect(0, 0, 12, 16)

    const cells = renderState.cells
    for (let y = 0; y < 88; y++) {
      cells[y] = []

      for (let x = 0; x < 150; x++) {
        const background = new PIXI.Graphics(rectangle.geometry)
        background.position.set(x * 12, y * 16)
        app.stage.addChild(background)

        const symbol = new PIXI.BitmapText(lines[y].charAt(x), { fontName: FontNames.Map })
        symbol.anchor.set(0.5)
        symbol.position.set(x * 12 + 6, y * 16 + 8)
        app.stage.addChild(symbol)

        cells[y][x] = {
          background,
          symbol,
        }
      }
    }

    app.ticker.add(handleTick)

    appRef.current = app
  }, [handleTick])

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
