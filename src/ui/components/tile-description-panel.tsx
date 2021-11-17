import './log-panel.css'

import { useWorld } from 'ui/hooks/use-world'
import { WithExtraClasses } from 'ui/to-class-name'

import { Panel, PanelProps } from './panel'

export type TileDescriptionPanelProps = WithExtraClasses & Omit<PanelProps, 'className'> & {
  /** number of log rows to display */
  rows?: number
}

export const TileDescriptionPanel = ({ rows = 8, ...rest }: TileDescriptionPanelProps) => {
  const world = useWorld()

  const player = world.player
  const map = world.map
  const tile = map.getMapTile(player.x, player.y)
  const name = tile?.terrain.name
  const description = tile?.terrain.description ?? 'You see nothing of note here.'

  return (
    <Panel {...rest}
      classes="description-panel"
      rows={rows}
      title={name}
    >
      {description}
    </Panel>
  )
}
