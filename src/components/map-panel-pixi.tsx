import { ShaderSystem } from '@pixi/core'
import { install } from '@pixi/unsafe-eval'
import useSize from '@react-hook/size'
import { times } from 'lodash'
import { map, slice } from 'lodash/fp'
import * as PIXI from 'pixi.js'
import { useEffect, useRef, useState } from 'react'

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

export const MapPanel = () => {
  const canvasRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<PIXI.Application | null>(null)
  const [width, height] = useSize(canvasRef)

  const [x, setX] = useState(0)
  const [y, setY] = useState(0)

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('resize!', width, height)
  }, [width, height])

  useEffect(() => {
    setTimeout(() => {
      setX((x + 1) % 4500)
      if (x % 2 === 0) {
        setY((y + 1) % 4500)
      }
    }, 1000 / 20)
  })

  const rowSelection = slice(y, y + 250, lines)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const rows = map((row) => row.substring(x, x + 250), rowSelection)

  // let key = 0
  // const colorizeRow = (row: string) => row.split('').map((c) => {
  //   const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`
  //   return <span key={key++} style={{ color: randomColor }}>{c}</span>
  // })

  useEffect(() => {
    if (canvasRef.current !== null) {
      appRef.current = new PIXI.Application({
        backgroundColor: 0x000000,
        resizeTo: canvasRef.current,
      })
      const app = appRef.current

      // Add app to DOM
      canvasRef.current.appendChild(app.view)
      app.start()

      const fontName = 'Nova Mono'

      PIXI.BitmapFont.from(fontName, {
        fill: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
        dropShadow: false,
      })

      const cells: PIXI.BitmapText[][] = []

      let xOffset = 0
      let yOffset = 0

      for (let y = 0; y < 88; y++) {
        cells[y] = []

        for (let x = 0; x < 150; x++) {
          const cell = new PIXI.BitmapText(lines[y].charAt(x), { fontName })
          cell.anchor.set(0.5)
          cell.position.set(x * 12 + 6, y * 16 + 8)
          app.stage.addChild(cell)

          cells[y][x] = cell
        }
      }

      let timeSinceScroll = 0.0
      app.ticker.add((delta) => {
        timeSinceScroll += delta

        if (timeSinceScroll > (1000 / 100)) {
          xOffset = (xOffset + 1) % 2000
          yOffset = (yOffset + 1) % 2000
          for (let y = 0; y < 88; y++) {
            for (let x = 0; x < 150; x++) {
              cells[y][x].text = lines[yOffset + y][xOffset + x]
              cells[y][x].tint = Math.floor(Math.random() * 16777215)
            }
          }
          timeSinceScroll -= (1000 / 100)
        }
      })
    }

    return () => {
      if (appRef.current !== null) {
        appRef.current.destroy()
      }
    }
  }, [])

  return (<>
    <Panel>
      <div style={{ flex: 1, height: '100%' }} ref={canvasRef} />
    </Panel>
  </>)
}
