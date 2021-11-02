import './app.css'
import { loadFonts } from 'fonts'
import { useCallback, useState } from 'react'

import { DungeonScreen } from './dungeon-screen'
import { ExpeditionEndedScreen } from './expedition-ended-screen'
import { TitleScreen } from './title-screen'

export type ScreenName = 'dungeon' | 'expedition-ended' | 'title'

function App () {
  const [ready, setReady] = useState(false)
  const [activeScreen, setActiveScreen] = useState<ScreenName>('expedition-ended')

  loadFonts().then(() => setReady(true))

  const handleExit = useCallback(() => {
    (window as any).ipcRenderer.send('exit')
  }, [])

  const getActiveScreen = () => {
    switch (activeScreen) {
      case 'dungeon':
        return <DungeonScreen />

      case 'expedition-ended':
        return <ExpeditionEndedScreen navigateTo={setActiveScreen} />

      default:
        return <TitleScreen exit={handleExit} navigateTo={setActiveScreen} />
    }
  }

  return ready ? getActiveScreen() : <div>Loading...</div>
}

export default App
