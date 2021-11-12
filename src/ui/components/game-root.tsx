import { DemoCampaign } from 'engine/campaign'
import { createWorld } from 'engine/world-factory'
import { useEffect, useRef } from 'react'
import { useResetRecoilState } from 'recoil'
import { CampaignContext } from 'ui/context-campaign'
import { GameContext } from 'ui/context-game'
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
  const campaign = useRef(new DemoCampaign())
  const world = useRef(createWorld(campaign.current))
  const resetExpedition = useResetRecoilState(expeditionState)

  useEffect(() => {
    resetExpedition()

    const currentWorld = world.current
    currentWorld.start()

    return () => {
      currentWorld.stop()
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
    <CampaignContext.Provider value={campaign.current}>
      <GameContext.Provider value={world.current}>
        {getActiveScreen()}
      </GameContext.Provider>
    </CampaignContext.Provider>
  )
}
