import { useRecoilValue } from 'recoil'
import { expeditionState, InitialLinkValue } from 'ui/state/expedition'
import { playerState } from 'ui/state/player'

import { Panel, PanelProps } from './panel'
import { PreFormattedText } from './pre-formatted-text'

export const PlayerStatusPanel = (props: Omit<PanelProps, 'rows'>) => {
  const expedition = useRecoilValue(expeditionState)
  const player = useRecoilValue(playerState)

  const status = `${player.name} - Level X (0/100?)
Health : ${player.health}/${player.healthMax}
Link   : ${Math.floor(expedition.link / InitialLinkValue * 100)}%

Defense: WRONG!
Melee  : ${player.melee}
Missile: 1?
Focus  : 1?
Turn   : ${expedition.turn}
`

  return (
    <Panel {...props} rows={9}>
      <PreFormattedText>{status}</PreFormattedText>
    </Panel>
  )
}
