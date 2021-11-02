import { ScreenName } from './app'
import './expedition-ended-screen.css'
import { Panel } from './panel'

export interface ExpeditionEndedScreenProps {
  /** function that allows inter-screen navigation */
  navigateTo: (screen: ScreenName) => void
}

export const ExpeditionEndedScreen = (_: ExpeditionEndedScreenProps) => {
  return (
    <div className="screen-container">
      <h1 className="screen-title">Your Expedition has Ended</h1>
      <Panel
        containerClass="screen-content-container"
        rows={25}
        columns={90}
      >
        Lipsum
      </Panel>
      <p className="screen-footer animated-option">Press any key to continue </p>
    </div>
  )
}
