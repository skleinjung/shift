import { map, reverse } from 'lodash/fp'
import { useCallback, useEffect, useState } from 'react'
import { World } from 'world/world'

import { Panel } from './panel'

import './log-panel.css'

export interface LogPanelOptions {
  /** number of log rows to display */
  rows?: number

  /** the world to log events from */
  world: World
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const LogPanel = ({ rows = 8, world }: LogPanelOptions) => {
  const [lines, setLines] = useState<string[]>(world.messages)

  const appendMessage = useCallback((message: string) => {
    setLines((lines) => [...lines, message])
  }, [])

  useEffect(() => {
    world.on('message', appendMessage)
    return () => {
      world.off('message', appendMessage)
    }
  }, [appendMessage, world])

  let index = 0

  return (
    <Panel className="log-panel" rows={rows}>
      {map((line) => <div key={index++}>{line}</div>, reverse(lines))}
    </Panel>
  )
}
