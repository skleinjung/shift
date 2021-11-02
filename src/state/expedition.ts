import { atom, useRecoilState } from 'recoil'

const InitialLinkValue = 50

export interface Expedition {
  /** the strength of the player's link to the current expedition's location */
  link: number

  /** the current turn number */
  turn: number
}

export interface ExpeditionModel extends Expedition {
  /** finish the expedition turn, and move the simulation to the next one */
  nextTurn: () => void

  /** reset the expedition to prepare a new one to start */
  reset: () => void
}

export const expeditionState = atom<Expedition>({
  key: 'expeditionState',
  default: {
    link: InitialLinkValue,
    turn: 1,
  },
})

export const useExpedition = (): ExpeditionModel => {
  const [expedition, setExpedition] = useRecoilState(expeditionState)

  return {
    ...expedition,
    nextTurn: () => {
      setExpedition((old) => ({
        ...old,
        link: old.link - 1,
        turn: old.turn + 1,
      }))
    },
    reset: () => {
      setExpedition({
        link: InitialLinkValue,
        turn: 1,
      })
    },
  }
}
