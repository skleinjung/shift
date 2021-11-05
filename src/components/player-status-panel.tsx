import { useRecoilValue } from 'recoil'
import { expeditionState, InitialLinkValue } from 'state/expedition'
import { playerState } from 'state/player'

import { Panel, PanelProps } from './panel'
import { PreFormattedText } from './pre-formatted-text'

export const PlayerStatusPanel = (props: Omit<PanelProps, 'rows'>) => {
  const expedition = useRecoilValue(expeditionState)
  const player = useRecoilValue(playerState)

  const status = `${player.name} - Level X
Turn   : ${expedition.turn}

Health : ${player.health}/${player.healthMax}
Link   : ${Math.floor(expedition.link / InitialLinkValue * 100)}%
XP     : 0/100?

Melee  : ${player.melee}
Missile: 1?
Focus  : 1?`

  return (
    <Panel {...props} rows={10}>
      <PreFormattedText>{status}</PreFormattedText>
    </Panel>
  )
}
