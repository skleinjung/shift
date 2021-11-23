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

export const LogPanel = ({ rows, world, ...rest }: LogPanelOptions) => {
  const [lines, setLines] = useState<string[]>(world.messages)

  const worldUpdated = useCallback(() => {
    setLines([...world.messages])
  }, [world.messages])

  useEffect(() => {
    world.on('update', worldUpdated)
    return () => {
      world.off('update', worldUpdated)
    }
  }, [worldUpdated, world])

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
