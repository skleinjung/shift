import { atom } from 'recoil'

export interface Player {
  /** player's character name */
  name: string
}

export const playerState = atom<Player>({
  key: 'playerState',
  default: {
    name: 'Mystericus the Untitled',
  },
})
