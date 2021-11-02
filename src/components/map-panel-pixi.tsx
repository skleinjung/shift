import { ShaderSystem } from '@pixi/core'
import { install } from '@pixi/unsafe-eval'
import { times } from 'lodash'
import { map, noop, slice } from 'lodash/fp'
import * as PIXI from 'pixi.js'
import { useEffect, useRef, useState } from 'react'

import dragon from '../assets/dragon.png'

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
  const [x, setX] = useState(0)
  const [y, setY] = useState(0)

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

  // const colored = map(colorizeRow, rows)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current !== null) {
      // On first render create our application
      const app = new PIXI.Application({
        width: 800,
        height: 600,
        backgroundColor: 0x5BBA6F,
      })

      // Add app to DOM
      ref.current.appendChild(app.view)
      app.start()

      const sprite = PIXI.Sprite.from(dragon)
      app.stage.addChild(sprite)

      // Add a variable to count up the seconds our demo has been running
      let elapsed = 0.0
      // Tell our application's ticker to run a new callback every frame, passing
      // in the amount of time that has passed since the last tick
      app.ticker.add((delta) => {
        // Add the time to our total elapsed time
        elapsed += delta
        // Update the sprite's X position based on the cosine of our elapsed time.  We divide
        // by 50 to slow the animation down a bit...
        sprite.x = 100.0 + Math.cos(elapsed / 50.0) * 100.0
      })

      return () => {
        // On unload completely destroy the application and all of it's children
        app.destroy(true, true)
      }
    } else {
      return noop
    }
  }, [])

  return (<>
    <img
      src={dragon}
      width={218}
      height={181}
    />

    <div ref={ref} />
  </>)
}
