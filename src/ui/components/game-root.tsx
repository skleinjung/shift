import { GameController } from 'engine/api/game-controller'
import { useEffect, useRef } from 'react'
import { useResetRecoilState } from 'recoil'
import { GameControllerContext } from 'ui/context-game'
import { expeditionState } from 'ui/state/expedition'

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
  const gameRef = useRef(new GameController(uiRef.current))
  const resetExpedition = useResetRecoilState(expeditionState)

  useEffect(() => {
    resetExpedition()

    const game = gameRef.current
    const currentEngine = game.engine
    currentEngine.start()

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
    <GameControllerContext.Provider value={gameRef.current}>
      <UiControllerBinding ui={uiRef.current}>
        {getActiveScreen()}
      </UiControllerBinding>
    </GameControllerContext.Provider>
  )
}
