import { atom } from 'recoil'

/** State of the game itself, such as the active screen, pause state, etc. */
export interface Game {
  /** whether the game has been paused or not */
  paused: boolean
}

export const newGame = (): Game => ({
  paused: false,
})

export const gameState = atom<Game>({
  key: 'gameState',
  default: newGame(),
})

export const pause = (game: Game): Game => ({
  ...game,
  paused: true,
})

export const unpause = (game: Game): Game => ({
  ...game,
  paused: false,
})
