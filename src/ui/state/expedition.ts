import { atom } from 'recoil'

export interface Objective {
  /** explanatory text or summary of the objective */
  description: string

  /** total progress required to consider this objective complete */
  goal: number

  /** human-readable title of the objective */
  name: string

  /** current progress towards this objective (kill count, # of items, etc.) */
  progress: number
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
