import './app.css'
import { loadFonts } from 'fonts'
import { useState } from 'react'

import { DungeonScreen } from './dungeon-screen'

function App () {
  const [ready, setReady] = useState(false)

  loadFonts().then(() => setReady(true))

  return ready ? (
    <DungeonScreen />
  ) : <div>Loading...</div>
}

export default App
