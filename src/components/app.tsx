import './app.css'
import { loadFonts } from 'fonts'
import { useCallback, useState } from 'react'

import { DungeonScreen } from './dungeon-screen'
import { TitleScreen } from './title-screen'

export type ScreenName = 'dungeon' | 'exit' | 'game-over' | 'title'

function App () {
  const [ready, setReady] = useState(false)
  const [activeScreen, setActiveScreen] = useState<ScreenName>('title')

  loadFonts().then(() => setReady(true))

  const handleExit = useCallback(() => {
    (window as any).ipcRenderer.send('exit')
  }, [])

  const getActiveScreen = () => {
    switch (activeScreen) {
      case 'dungeon':
        return <DungeonScreen />

      default:
        return <TitleScreen exit={handleExit} navigateTo={setActiveScreen} />
    }
  }

  return ready ? getActiveScreen() : <div>Loading...</div>
}

export default App
