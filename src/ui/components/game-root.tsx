import { DemoCampaign } from 'engine/campaign'
import { useEffect, useRef } from 'react'
import { useResetRecoilState } from 'recoil'
import { CampaignContext } from 'ui/context-campaign'
import { EngineContext } from 'ui/context-engine'
import { expeditionState } from 'ui/state/expedition'

import { Engine } from '../../engine/engine'

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
  const engine = useRef(new Engine(campaign.current))
  const resetExpedition = useResetRecoilState(expeditionState)

  useEffect(() => {
    resetExpedition()

    const currentEngine = engine.current
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
    <CampaignContext.Provider value={campaign.current}>
      <EngineContext.Provider value={engine.current}>
        {getActiveScreen()}
      </EngineContext.Provider>
    </CampaignContext.Provider>
  )
}
