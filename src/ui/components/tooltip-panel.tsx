import './log-panel.css'

import { MapTile } from 'engine/map/map'
import { Player } from 'engine/player'
import { join, map } from 'lodash/fp'
import { WithExtraClasses } from 'ui/to-class-name'

import { Panel, PanelProps } from './panel'

export type TooltipPanelProps = WithExtraClasses & Omit<PanelProps, 'className'> & {
  /** the map tile to display a tooltip for, if any */
  focusedTile?: MapTile

  /** number of log rows to display */
  rows?: number
}

export const TooltipPanel = ({
  focusedTile,
  rows = 8,
  ...rest
}: TooltipPanelProps) => {
  const observations: string[] = []

  if (focusedTile !== undefined) {
    if (focusedTile.creature !== undefined) {
      const creature = focusedTile.creature

      observations.push(creature instanceof Player ? 'yourself' : `a ${creature.name}`)
    }

    if (focusedTile.items.length > 0) {
      const items = focusedTile.items

      if (items.length === 1) {
        observations.push(` ${items[0].name}`)
      } else {
        observations.push('some things on the ground')
      }
    }
  }

  // one item per line, with an asterisk in front
  const observationString = observations.length < 1
    ? 'You see nothing here.'
    : `You see:\n${join('\n', map((item) => {
      return `* ${item}`
    }, observations))}`

  return (
    <Panel {...rest}
      classes="tooltip-panel"
      rows={rows}
      style={{ whiteSpace: 'pre-line' }}
      title={focusedTile?.terrain.name}
    >{focusedTile && observationString}
    </Panel>
  )
}
