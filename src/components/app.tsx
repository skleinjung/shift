import './app.css'
import FontFaceObserver from 'fontfaceobserver'
import { useState } from 'react'

import { DungeonScreen } from './dungeon-screen'

function App () {
  const [ready, setReady] = useState(false)

  const fontName = 'Nova Mono'
  new FontFaceObserver(fontName, {}).load()
    .then(() => setReady(true))

  return ready ? (
    <DungeonScreen />
  ) : <div>Loading...</div>
}

export default App
