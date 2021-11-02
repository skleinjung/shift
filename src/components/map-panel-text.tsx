import { times } from 'lodash'
import { join, map, slice } from 'lodash/fp'
import { useEffect, useState } from 'react'

import { Panel } from './panel'

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
  const rows = map((row) => row.substring(x, x + 250), rowSelection)

  // let key = 0
  // const colorizeRow = (row: string) => row.split('').map((c) => {
  //   const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`
  //   return <span key={key++} style={{ color: randomColor }}>{c}</span>
  // })

  // const colored = map(colorizeRow, rows)

  return (
    <Panel className="map-content" active={true}>
      {join('\n', rows)}
    </Panel>
  )
}
