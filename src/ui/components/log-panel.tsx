import { World } from 'engine/world'
import { map, reverse } from 'lodash/fp'
import { useCallback, useEffect, useState } from 'react'

import { Panel, PanelProps } from './panel'

import './log-panel.css'

export interface LogPanelOptions extends Omit<PanelProps, 'rows'> {
  /** number of log rows to display */
  rows?: number

  /** the world to log events from */
  world: World
}

export const LogPanel = ({ rows = 8, world, ...rest }: LogPanelOptions) => {
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
    <Panel {...rest}
      classes="log-panel"
      rows={rows}
    >
      {map((line) => <div key={index++}>{line}</div>, reverse(lines))}
    </Panel>
  )
}
