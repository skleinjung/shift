import { PropsWithChildren, useCallback } from 'react'
import { useRecoilValue } from 'recoil'
import { expeditionState } from 'state/expedition'
import { playerState } from 'state/player'

import { ScreenName } from './app'
import './expedition-ended-screen.css'
import { Panel } from './panel'

export interface ExpeditionEndedScreenProps {
  /** function that allows inter-screen navigation */
  navigateTo: (screen: ScreenName) => void
}

const MultiLineText = ({ children }: PropsWithChildren<Record<string, unknown>>) => (
  <div style={{ whiteSpace: 'pre-line' }}>{children}</div>
)

export const ExpeditionEndedScreen = ({ navigateTo }: ExpeditionEndedScreenProps) => {
  const expedition = useRecoilValue(expeditionState)
  const player = useRecoilValue(playerState)

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
    navigateTo('title')
  }, [navigateTo])

  const expeditionSummary =
    `${player.name}
    
    Turn: ${expedition.turn}`

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
          <MultiLineText>{expeditionSummary}</MultiLineText>
        </Panel>
      </div>
      <p className="screen-footer animated-option">Press any key to continue </p>
    </div>
  )
}
