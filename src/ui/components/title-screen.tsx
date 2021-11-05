import { ScreenName } from './app'
import { ScreenMenu } from './screen-menu'
import './title-screen.css'

export interface TitleScreenProps {
  /** called when the user requests to exit the app */
  exit: () => void

  /** function that allows inter-screen navigation */
  navigateTo: (screen: ScreenName) => void
}

export const TitleScreen = ({ exit, navigateTo }: TitleScreenProps) => {
  return (
    <>
      <h1 className="game-title">Shift</h1>
      <ScreenMenu
        items={['New Game', 'Exit']}
        onSelectionConfirmed={(item) => {
          switch (item) {
            case 'New Game':
              navigateTo('dungeon')
              break

            case 'Exit':
              exit()
              break
          }
        }}
      />
    </>
  )
}
