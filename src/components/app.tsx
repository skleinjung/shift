import './app.css'
import { loadFonts } from 'fonts'
import { useState } from 'react'

import { TitleScreen } from './title-screen'

function App () {
  const [ready, setReady] = useState(false)

  loadFonts().then(() => setReady(true))

  return ready ? (
    <TitleScreen />
  ) : <div>Loading...</div>
}

export default App
