import { World } from 'engine/world'
import { map, reverse } from 'lodash/fp'
import { useCallback, useEffect, useState } from 'react'

import { Panel } from './panel'

import './log-panel.css'

export interface LogPanelOptions {
  /** number of log rows to display */
  rows?: number

  /** the world to log events from */
  world: World
}

export const LogPanel = ({ rows = 8, world }: LogPanelOptions) => {
  const [lines, setLines] = useState<string[]>(world.messages)

  const messageAdded = useCallback(() => {
    setLines([...world.messages])
  }, [world.messages])

  useEffect(() => {
    world.on('message', messageAdded)
    return () => {
      world.off('message', messageAdded)
    }
  }, [messageAdded, world])

  let index = 0

  return (
    <Panel className="log-panel" rows={rows}>
      {map((line) => <div key={index++}>{line}</div>, reverse(lines))}
    </Panel>
  )
}
