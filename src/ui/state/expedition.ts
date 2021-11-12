import { atom } from 'recoil'

export interface Objective {
  /** explanatory text or summary of the objective */
  description: string

  /** human-readable title of the objective */
  name: string
}

export interface Expedition {
  /** objectives for the current expedition */
  objectives: Objective[]

  /** the current turn number */
  turn: number
}

export const newExpedition = (): Expedition => ({
  objectives: [],
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
