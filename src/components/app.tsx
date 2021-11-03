import './app.css'
import { loadFonts } from 'fonts'
import { useCallback, useState } from 'react'
import { RecoilRoot } from 'recoil'

import { ExpeditionEndedScreen } from './expedition-ended-screen'
import { ExpeditionScreen } from './expedition-screen'
import { TitleScreen } from './title-screen'

export type ScreenName = 'dungeon' | 'expedition-ended' | 'title'

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
        return <ExpeditionScreen navigateTo={setActiveScreen}/>

      case 'expedition-ended':
        return <ExpeditionEndedScreen navigateTo={setActiveScreen} />

      default:
        return <TitleScreen exit={handleExit} navigateTo={setActiveScreen} />
    }
  }

  return (
    <RecoilRoot>{
      ready
        ? getActiveScreen()
        : <div>Loading...</div>
    }</RecoilRoot>
  )
}

export default App
