import { World } from 'engine/world'
import { useEffect, useState } from 'react'
import { GameContext } from 'ui/game-context'

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

  useEffect(() => {
    const world = new World()
    world.start()
    setWorld(world)

    return () => {
      world.stop()
    }
  }, [])

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
