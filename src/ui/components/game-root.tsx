import { World } from 'engine/world'
import { useEffect, useState } from 'react'
import { useResetRecoilState } from 'recoil'
import { GameContext } from 'ui/game-context'
import { expeditionState } from 'ui/state/expedition'

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
  const [world, setWorld] = useState<World | undefined>()
  const resetExpedition = useResetRecoilState(expeditionState)

  useEffect(() => {
    resetExpedition()

    const world = new World()
    world.start()
    setWorld(world)

    return () => {
      world.stop()
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

  return world === undefined ? null : (
    <GameContext.Provider value={world}>
      {getActiveScreen()}
    </GameContext.Provider>
  )
}
