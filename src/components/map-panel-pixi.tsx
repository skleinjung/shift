import { ShaderSystem } from '@pixi/core'
import { install } from '@pixi/unsafe-eval'
import { FontNames } from 'fonts'
import { times } from 'lodash'
import * as PIXI from 'pixi.js'
import { useCallback, useRef } from 'react'
import { useRecoilCallback } from 'recoil'
import { endTurn as endExpeditionTurn, expeditionState } from 'state/expedition'
import { gameState } from 'state/game'
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

interface RenderState {
  cells: PIXI.BitmapText[][]
  xOffset: number
  yOffset: number
}

export const MapPanel = () => {
  const timeSinceScrollRef = useRef<number>(0)
  const renderStateRef = useRef<RenderState>({
    cells: [],
    xOffset: 0,
    yOffset: 0,
  })

  const appRef = useRef<PIXI.Application | null>(null)

  const handleTick = useRecoilCallback(({ set, snapshot }) => (delta: number) => {
    const paused = snapshot.getLoadable(gameState).valueOrThrow().paused

    if (paused) {
      return
    }

    timeSinceScrollRef.current += delta

    if (timeSinceScrollRef.current < (1000 / 100)) {
      return
    }

    const renderState = renderStateRef.current
    const cells = renderState.cells

    if (Math.random() * 100 < 20) {
      set(playerState, dealDamage(1))
    }

    set(playerState, endTurn)
    set(expeditionState, endExpeditionTurn)

    renderState.xOffset = (renderState.xOffset + 1) % 2000
    renderState.yOffset = (renderState.yOffset + 1) % 2000
    for (let y = 0; y < 88; y++) {
      for (let x = 0; x < 150; x++) {
        cells[y][x].text = lines[renderState.yOffset + y][renderState.xOffset + x]
        cells[y][x].tint = Math.floor(Math.random() * 16777215)
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

    PIXI.BitmapFont.from(FontNames.Map, {
      fill: '#ffffff',
      fontSize: 16,
      fontWeight: 'bold',
      dropShadow: false,
    })

    const renderState = renderStateRef.current

    const cells = renderState.cells
    for (let y = 0; y < 88; y++) {
      cells[y] = []

      for (let x = 0; x < 150; x++) {
        const cell = new PIXI.BitmapText(lines[y].charAt(x), { fontName: FontNames.Map })
        cell.anchor.set(0.5)
        cell.position.set(x * 12 + 6, y * 16 + 8)
        app.stage.addChild(cell)

        cells[y][x] = cell
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
