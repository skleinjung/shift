import { InitialLinkValue } from 'engine/player'
import { useRecoilValue } from 'recoil'
import { useWorld } from 'ui/hooks/use-world'
import { expeditionState } from 'ui/state/expedition'

import { Panel, PanelProps } from './panel'
import { PreFormattedText } from './pre-formatted-text'

export type PlayerStatusPanelProps = Omit<PanelProps, 'rows'>

export const PlayerStatusPanel = ({ ...rest }: PlayerStatusPanelProps) => {
  const expedition = useRecoilValue(expeditionState)
  const player = useWorld().player

  const status = `${player.name} - Level X (0/100?)

Health : ${player.health}/${player.healthMax}
Link   : ${Math.floor(player.link / InitialLinkValue * 100)}%

Defense: ${player.defense}
Melee  : ${player.melee}
Missile: undefined
Focus  : undefined

Turn   : ${expedition.turn}
`

  return (
    <Panel {...rest} rows={11}>
      <PreFormattedText>{status}</PreFormattedText>
    </Panel>
  )
}
