import './app.css'

import { loadAll } from 'engine/assets'
import { useCallback, useEffect, useState } from 'react'
import { RecoilRoot } from 'recoil'

import { loadFonts } from '../fonts'

import { GameRoot } from './game-root'
import { TitleScreen } from './title-screen'

export type ScreenName = 'dungeon' | 'expedition-ended' | 'title'

function App () {
  const [ready, setReady] = useState(false)
  const [activeScreen, setActiveScreen] = useState<ScreenName>('title')
  useEffect(() => {
    Promise.all([loadFonts(), loadAll()]).then(() => setReady(true))
  }, [])

  const handleExit = useCallback(() => {
    (window as any).ipcRenderer.send('exit')
  }, [])

  const handleNavigate = useCallback((screen: ScreenName) => {
    setActiveScreen(screen)
  }, [])

  const getActiveScreen = () => {
    switch (activeScreen) {
      case 'dungeon':
      case 'expedition-ended':
        return <GameRoot navigateTo={handleNavigate} screen={activeScreen} />

      default:
        return <TitleScreen exit={handleExit} navigateTo={handleNavigate} />
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
