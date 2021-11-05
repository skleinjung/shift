import { atom, selector } from 'recoil'

import { playerState } from './player'

export const InitialLinkValue = 5000

export interface Expedition {
  /** the strength of the player's link to the current expedition's location */
  link: number

  /** the current turn number */
  turn: number
}

export const newExpedition = (): Expedition => ({
  link: InitialLinkValue,
  turn: 1,
})

export const expeditionState = atom<Expedition>({
  key: 'expeditionState',
  default: newExpedition(),
})

export const endTurn = (expedition: Expedition): Expedition => ({
  ...expedition,
  link: expedition.link - 1,
  turn: expedition.turn + 1,
})

export const isExpeditionComplete = selector({
  key: 'isExpeditionComplete',
  get: ({ get }) => {
    const expedition = get(expeditionState)
    const player = get(playerState)
    return expedition.link < 1 || player.health < 1
  },
})
