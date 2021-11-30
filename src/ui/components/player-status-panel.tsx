import { useWorld } from 'ui/hooks/use-world'

import { Panel, PanelProps } from './panel'
import { PreFormattedText } from './pre-formatted-text'

export type PlayerStatusPanelProps = Omit<PanelProps, 'rows'>

export const PlayerStatusPanel = ({ ...rest }: PlayerStatusPanelProps) => {
  const player = useWorld().player

  const status = `${player.name} - Level X (0/100?)

Health : ${player.health}/${player.healthMax}

Defense: ${player.defense}
Melee  : ${player.melee}

Turn   : ${player.turn}
`

  return (
    <Panel {...rest} rows={8}>
      <PreFormattedText>{status}</PreFormattedText>
    </Panel>
  )
}
