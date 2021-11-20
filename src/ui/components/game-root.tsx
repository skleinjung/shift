import { GameController } from 'engine/api/game-controller'
import { UiController } from 'engine/api/ui-api'
import { useEffect, useRef } from 'react'
import { useResetRecoilState } from 'recoil'
import { CampaignContext } from 'ui/context-campaign'
import { EngineContext } from 'ui/context-engine'
import { expeditionState } from 'ui/state/expedition'
import { ReactUiController } from 'ui/ui-controller'

import { ScreenName } from './app'
import { ExpeditionEndedScreen } from './expedition-ended-screen'
import { ExpeditionScreen } from './expedition-screen'

export interface GameProps {
  /** function that allows inter-screen navigation */
  navigateTo: (screen: ScreenName) => void

  /** current screen to render */
  screen: ScreenName
}

export const GameRoot = ({ navigateTo, screen }: GameProps) => {
  const uiRef = useRef<UiController>(new ReactUiController())
  const gameRef = useRef(new GameController(uiRef.current))
  const resetExpedition = useResetRecoilState(expeditionState)

  useEffect(() => {
    resetExpedition()

    const game = gameRef.current
    const currentEngine = game.engine
    currentEngine.start()

    uiRef.current.emit('ready', { ui: uiRef.current })

    return () => {
      currentEngine.stop()
    }
  }, [resetExpedition])

  const getActiveScreen = () => {
    switch (screen) {
      case 'expedition-ended':
        return <ExpeditionEndedScreen navigateTo={navigateTo} />

      default:
        return <ExpeditionScreen navigateTo={navigateTo}/>
    }
  }

  return (
    <CampaignContext.Provider value={gameRef.current.campaign}>
      <EngineContext.Provider value={gameRef.current.engine}>
        {getActiveScreen()}
      </EngineContext.Provider>
    </CampaignContext.Provider>
  )
}
