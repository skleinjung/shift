import { GameController } from 'engine/api/game-controller'
import { DemoCampaign } from 'engine/campaign'
import { Engine } from 'engine/engine'
import { useEffect, useRef } from 'react'
import { useResetRecoilState } from 'recoil'
import { GameControllerContext } from 'ui/context-game'
import { expeditionState } from 'ui/state/expedition'
import { uiState } from 'ui/state/ui'

import { ScreenName } from './app'
import { ExpeditionEndedScreen } from './expedition-ended-screen'
import { ExpeditionScreen } from './expedition-screen'
import { RebindableUiController, UiControllerBinding } from './ui-controller-binding'

export interface GameProps {
  /** function that allows inter-screen navigation */
  navigateTo: (screen: ScreenName) => void

  /** current screen to render */
  screen: ScreenName
}

export const GameRoot = ({ navigateTo, screen }: GameProps) => {
  const uiRef = useRef(new RebindableUiController())
  const gameRef = useRef(new GameController(uiRef.current, new DemoCampaign()))
  const engineRef = useRef(new Engine(gameRef.current))
  const resetExpedition = useResetRecoilState(expeditionState)
  const resetUi = useResetRecoilState(uiState)

  useEffect(() => {
    resetExpedition()
    resetUi()

    const currentEngine = engineRef.current
    currentEngine.start()

    return () => {
      currentEngine.stop()
    }
  }, [resetExpedition, resetUi])

  const getActiveScreen = () => {
    switch (screen) {
      case 'expedition-ended':
        return <ExpeditionEndedScreen navigateTo={navigateTo} title="Your Expedition has Ended" />

      case 'victory':
        return (<ExpeditionEndedScreen
          navigateTo={navigateTo}
          title="You made it back home!"
          victory={true}
        />)

      default:
        return <ExpeditionScreen navigateTo={navigateTo}/>
    }
  }

  return (
    <GameControllerContext.Provider value={gameRef.current}>
      <UiControllerBinding ui={uiRef.current}>
        {getActiveScreen()}
      </UiControllerBinding>
    </GameControllerContext.Provider>
  )
}
