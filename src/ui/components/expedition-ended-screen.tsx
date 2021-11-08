import { useCallback } from 'react'
import { useRecoilValue, useResetRecoilState } from 'recoil'
import { useWorld } from 'ui/hooks/use-world'
import { expeditionState } from 'ui/state/expedition'

import { ScreenName } from './app'
import './expedition-ended-screen.css'
import { Panel } from './panel'
import { PreFormattedText } from './pre-formatted-text'

export interface ExpeditionEndedScreenProps {
  /** function that allows inter-screen navigation */
  navigateTo: (screen: ScreenName) => void
}

export const ExpeditionEndedScreen = ({ navigateTo }: ExpeditionEndedScreenProps) => {
  const player = useWorld().player
  const expedition = useRecoilValue(expeditionState)
  const resetExpedition = useResetRecoilState(expeditionState)

  // update the focus when a new UL element is created
  const refCallback = useCallback((ul: HTMLDivElement) => {
    ul?.focus()
  }, [])

  // handle blur events by taking focus back
  // works on this screen, because we only have one element that we want to handle input
  const handleBlur = useCallback((event: React.FocusEvent<HTMLDivElement>) => {
    event.target.focus()
  }, [])

  const returnToTitle = useCallback(() => {
    resetExpedition()
    navigateTo('title')
  }, [resetExpedition, navigateTo])

  const fate = player.dead ? 'was killed' : 'lost his connection to this world'

  const expeditionSummary =
    `${player.name} ${fate}.
    
Turns: ${expedition.turn - 1}`

  return (
    <div
      className="screen-container"
      onBlur={handleBlur}
      onClick={returnToTitle}
      onKeyPress={returnToTitle}
      ref={refCallback}
      tabIndex={0}
    >
      <h1 className="screen-title">Your Expedition has Ended</h1>
      <div className="screen-content-container">
        <Panel
          rows={25}
          columns={90}
        >
          <PreFormattedText>{expeditionSummary}</PreFormattedText>
        </Panel>
      </div>
      <p className="screen-footer animated-option" style={{ cursor: 'pointer' }}>Press any key to continue </p>
    </div>
  )
}
