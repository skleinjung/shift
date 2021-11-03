import { atom } from 'recoil'

export interface Expedition {
  /** the current turn number */
  turn: number
}

export const newExpedition = (): Expedition => ({
  turn: 1,
})

export const expeditionState = atom<Expedition>({
  key: 'expeditionState',
  default: newExpedition(),
})

export const endTurn = (expedition: Expedition): Expedition => ({
  ...expedition,
  turn: expedition.turn + 1,
})
