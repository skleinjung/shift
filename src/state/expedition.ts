import { atom } from 'recoil'

export interface Expedition {
  /** the current turn number */
  turn: number
}

export const expeditionState = atom<Expedition>({
  key: 'expeditionState',
  default: {
    turn: 1,
  },
})
