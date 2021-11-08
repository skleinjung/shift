import './app.css'
import { World } from 'engine/world'
import { useCallback, useState } from 'react'
import { RecoilRoot } from 'recoil'
import { GameContext } from 'ui/game-context'

import { loadFonts } from '../fonts'

import { ExpeditionEndedScreen } from './expedition-ended-screen'
import { ExpeditionScreen } from './expedition-screen'
import { TitleScreen } from './title-screen'

export type ScreenName = 'dungeon' | 'expedition-ended' | 'title'

function App () {
  const [ready, setReady] = useState(false)
  const [activeScreen, setActiveScreen] = useState<ScreenName>('title')
  const [world, setWorld] = useState(new World())

  loadFonts().then(() => setReady(true))

  const handleExit = useCallback(() => {
    (window as any).ipcRenderer.send('exit')
  }, [])

  const handleNavigate = useCallback((screen: ScreenName) => {
    // initialize a new world when moving from the title screen to the game
    if (activeScreen === 'title' && screen === 'dungeon') {
      setWorld(new World())
    }

    setActiveScreen(screen)
  }, [activeScreen])

  const getActiveScreen = () => {
    switch (activeScreen) {
      case 'dungeon':
        return <ExpeditionScreen navigateTo={handleNavigate}/>

      case 'expedition-ended':
        return <ExpeditionEndedScreen navigateTo={handleNavigate} />

      default:
        return <TitleScreen exit={handleExit} navigateTo={handleNavigate} />
    }
  }

  return (
    <GameContext.Provider value={world}>
      <RecoilRoot>{
        ready
          ? getActiveScreen()
          : <div>Loading...</div>
      }</RecoilRoot>
    </GameContext.Provider>
  )
}

export default App
